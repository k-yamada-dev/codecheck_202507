import 'next-auth/jwt';
import { UserRole } from './role';

declare module 'next-auth' {
  interface Session {
    user: {
      tenantId?: string;
      roles?: UserRole[];
    } & DefaultSession['user'];
    idToken?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId?: string;
    roles?: UserRole[];
    idToken?: string;
    accessToken?: string;
  }
}
