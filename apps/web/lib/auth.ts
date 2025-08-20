import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@acme/db';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getConfig } from '@/config/config';

const config = getConfig();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          return null;
        }

        try {
          const decodedToken = await firebaseAdmin.auth().verifyIdToken(credentials.idToken);
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
            return { ...existingUser, id: existingUser.id };
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
            return { ...updatedUser, id: updatedUser.id };
          }

          // 3. どちらもなければ未招待ユーザーとしてエラー
          console.error('[authorize] No invited user found for email:', email);
          return null;
        } catch (error) {
          console.error('[authorize] Firebase token verification or upsert failed:', error);
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
        token.sub = user.id;
        token.tenantId = (user as { id: string; tenantId?: string }).tenantId;
      }
      if (token.sub && token.tenantId) {
        const userRoles = await prisma.userRole.findMany({
          where: {
            userId: token.sub,
            tenantId: token.tenantId,
          },
          select: {
            role: true,
          },
        });
        token.roles = userRoles.map(ur => ur.role);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.tenantId) {
        session.user.tenantId = token.tenantId as string;
      }
      if (token.roles) {
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
};
