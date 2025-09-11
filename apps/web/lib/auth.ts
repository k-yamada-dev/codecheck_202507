import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@acme/db';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getConfig } from '@/config/config';
import type { RoleType } from '@acme/contracts';

const config = getConfig();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' },
      },
      async authorize(credentials) {
        // debug: log that authorize was called and whether idToken exists (do NOT log token itself)
        try {
          console.log(
            '[auth] authorize called - credential keys:',
            credentials ? Object.keys(credentials) : null
          );
        } catch (e) {
          console.log('[auth] authorize debug log failed:', e);
        }
        const hasIdToken = !!credentials?.idToken;
        console.log(
          '[auth] idToken present:',
          hasIdToken,
          'idToken length:',
          credentials?.idToken ? credentials.idToken.length : 0
        );

        if (!credentials?.idToken) {
          return null;
        }

        try {
          const decodedToken = await firebaseAdmin
            .auth()
            .verifyIdToken(credentials.idToken);
          const { uid, email, name } = decodedToken;

          // 1. 既存ユーザー（externalId=uid, provider='firebase'）を検索
          const existingUser = await prisma.user.findFirst({
            where: {
              provider: 'firebase',
              externalId: uid,
              email: email,
              isDeleted: false,
            },
          });

          if (existingUser) {
            // プロフィール情報のみ同期
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: name || email,
                email: email,
              },
            });
            return {
              ...existingUser,
              id: existingUser.id,
              currentTenantId: (credentials as any)?.tenantId,
              idToken: (credentials as any)?.idToken,
            };
          }

          // 2. 招待スタブ（email一致, externalId=null）を検索
          const invitedStub = await prisma.user.findFirst({
            where: {
              provider: 'firebase',
              externalId: { equals: null as unknown as string },
              email: email,
              isDeleted: false,
            },
          });

          if (invitedStub) {
            // externalIdをuidで確定し、プロフィール情報も同期
            const updatedUser = await prisma.user.update({
              where: { id: invitedStub.id },
              data: {
                externalId: uid,
                name: name || email,
                email: email,
              },
            });
            return {
              ...updatedUser,
              id: updatedUser.id,
              currentTenantId: (credentials as any)?.tenantId,
              idToken: (credentials as any)?.idToken,
            };
          }

          // 3. どちらもなければ未招待ユーザーとしてエラー
          console.error('[authorize] No invited user found for email:', email);
          return null;
        } catch (error) {
          console.error(
            '[authorize] Firebase token verification or upsert failed:',
            error
          );
          return null;
        }
      },
    }),
  ],
  secret: config.nextAuth.secret,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // debug log removed
        // (auth.jwt) user present info removed in production
        token.sub = user.id;
        // preserve idToken so future re-auth/signIn can reuse it
        if ((user as any)?.idToken) {
          token.idToken = (user as any).idToken;
        }
        // If the authorize returned a requested tenant, honor it and set on token so it will become current
        const requestedTenant = (user as any)?.currentTenantId as
          | string
          | undefined;
        if (requestedTenant) {
          // debug log removed: honoring requestedTenant
          token.tenantId = requestedTenant;
        }
      }

      if (token.sub) {
        // get all userRoles for this user
        const userRoles = await prisma.userRole.findMany({
          where: {
            userId: token.sub,
          },
          select: {
            tenantId: true,
            role: true,
          },
        });

        // map tenantId -> roles[]
        const tenantsMap: Record<string, RoleType[]> = {};
        userRoles.forEach((ur) => {
          const t = ur.tenantId;
          if (!tenantsMap[t]) tenantsMap[t] = [];
          tenantsMap[t].push(ur.role as RoleType);
        });

        // fetch tenant metadata (name, tenantCode) for display
        const tenantIds = Object.keys(tenantsMap);
        const tenantsMeta =
          tenantIds.length > 0
            ? await prisma.tenant.findMany({
                where: { id: { in: tenantIds } },
                select: { id: true, name: true, tenantCode: true },
              })
            : [];

        // token.tenants: array of { tenantId, tenantCode?, name?, roles }
        token.tenants = tenantsMeta.map((t) => ({
          tenantId: t.id,
          tenantCode: t.tenantCode,
          name: t.name,
          roles: tenantsMap[t.id] || [],
        }));

        // determine current tenant: prioritize existing token.tenantId if it's still valid
        const existingTenantId = token.tenantId as string | undefined;
        if (existingTenantId && tenantsMap[existingTenantId]) {
          token.tenantId = existingTenantId;
        } else {
          token.tenantId = tenantIds[0] ?? null;
        }

        // token.roles holds roles for current tenant
        token.roles = token.tenantId ? tenantsMap[token.tenantId] || [] : [];
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      if (token.tenants) {
        session.user.tenants = token.tenants as {
          tenantId: string;
          tenantCode?: string;
          name?: string;
          roles: RoleType[];
        }[];
      }

      if (token.tenantId) {
        session.user.tenantId = token.tenantId as string;
      }

      if (token.roles) {
        session.user.roles = token.roles as RoleType[];
      }

      // expose idToken to client session so frontend can re-authenticate (signIn) when switching tenant
      if ((token as any).idToken) {
        session.user.idToken = (token as any).idToken as string;
      }

      return session;
    },
  },
};
