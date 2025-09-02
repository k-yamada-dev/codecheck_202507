import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/config/config';

export async function GET(req: NextRequest) {
  const config = getConfig();
  const { searchParams } = new URL(req.url);
  const idToken = searchParams.get('id_token');

  if (!idToken) {
    // id_tokenがない場合はログインページへ
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const keycloakIssuer = config.auth.keycloak.issuer;
    if (keycloakIssuer) {
      const logOutUrl = new URL(
        `${keycloakIssuer}/protocol/openid-connect/logout`
      );
      // NEXTAUTH_URL をベースにリダイレクトURIを生成
      const baseUri = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const postLogoutRedirectUri = new URL('/login', baseUri).toString();

      logOutUrl.searchParams.set(
        'post_logout_redirect_uri',
        postLogoutRedirectUri
      );
      logOutUrl.searchParams.set('id_token_hint', idToken);
      logOutUrl.searchParams.set('client_id', config.auth.keycloak.clientId);
      // KeycloakのログアウトURLにリダイレクト
      return NextResponse.redirect(logOutUrl.toString());
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }

  // エラー時や設定がない場合は、単純にログインページへ
  return NextResponse.redirect(new URL('/login', req.url));
}
