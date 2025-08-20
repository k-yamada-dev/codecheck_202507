import { Role } from '@prisma/client';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      tenantId?: string;
      roles?: Role[];
    } & DefaultSession['user'];
    idToken?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId?: string;
    roles?: Role[];
    idToken?: string;
    accessToken?: string;
  }
}
