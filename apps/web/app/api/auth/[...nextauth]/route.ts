import NextAuth from 'next-auth/next';
import { authOptions } from '@/lib/auth';

console.log('[NextAuth] route.ts loaded - handler initializing');

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
