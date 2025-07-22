import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { getConfig } from '@/app/config/config';
import { UserRole, ALL_ROLES } from '../types/role';
import { PrismaClient } from '@prisma/client';

const config = getConfig();
const prisma = new PrismaClient();

interface DecodedToken {
  realm_access?: {
    roles?: string[];
  };
  tenant_id?: string;
  name?: string;
  email?: string;
  sub?: string;
  preferred_username?: string;
  provider?: string;
  external_id?: string;
}

// トークンからロールを抽出するヘルパー関数
const getRolesFromToken = (token: DecodedToken): UserRole[] => {
  const roles = token?.realm_access?.roles || [];
  return roles.filter((role: string): role is UserRole => ALL_ROLES.includes(role as UserRole));
};
let cnt = 0;
export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: config.auth.keycloak.clientId,
      clientSecret: config.auth.keycloak.clientSecret,
      issuer: config.auth.keycloak.issuer,
      authorization: {
        params: {
          scope: 'openid email profile',
          code_challenge_method: 'S256',
          prompt: 'login',
        },
      },
    }),
  ],
  secret: config.nextAuth.secret,
  callbacks: {
    async jwt({ token, account, profile }) {
      // 初回サインイン時にアカウント情報が存在する場合
      if (account && account.access_token) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;

        // アクセストークンをデコードしてロールとテナントIDをtokenオブジェクトに格納
        const decodedAccessToken: DecodedToken = JSON.parse(
          Buffer.from(account.access_token.split('.')[1], 'base64').toString()
        );
        token.roles = getRolesFromToken(decodedAccessToken);
        token.tenantId = decodedAccessToken.tenant_id; // Keycloakのクレーム名をcamelCaseに変換

        // --- ユーザー情報をusersテーブルにUPSERT ---
        if (token.tenantId && token.sub) {
          const userId = token.sub;
          const tenantId = token.tenantId;
          const name = decodedAccessToken.name || decodedAccessToken.preferred_username || '';
          const email = decodedAccessToken.email || '';
          const provider = 'keycloak';
          const externalId = decodedAccessToken.external_id || token.sub;

          try {
            await prisma.user.upsert({
              where: {
                tenantId_id: {
                  tenantId,
                  id: userId,
                },
              },
              update: {
                provider,
                externalId,
                name,
                email,
              },
              create: {
                id: userId,
                tenantId,
                provider,
                externalId,
                name,
                email,
              },
            });
          } catch (e) {
            console.error('User upsert failed:', e);
          }
        }
        // --- ここまで ---
      }
      // 後続の呼び出しでは、tokenオブジェクトはそのまま返されるため、情報が維持される
      return token;
    },
    async session({ session, token }) {
      // jwtコールバックから渡されたtokenの情報をsessionオブジェクトに格納
      session.user.roles = token.roles;
      session.user.tenantId = token.tenantId;
      session.idToken = token.idToken;
      session.accessToken = token.accessToken;
      session.user.id = token.sub; // JWTのsubクレームをユーザーIDとして設定

      return session;
    },
  },
};
