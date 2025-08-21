import { USER_ROLE, type RoleType } from '@acme/contracts';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      tenantId?: string;
      roles?: RoleType[];
    } & DefaultSession['user'];
    idToken?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId?: string;
    roles?: RoleType[];
    idToken?: string;
    accessToken?: string;
  }
}

export { USER_ROLE };
