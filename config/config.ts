export interface Config {
  auth: {
    keycloak: {
      clientId: string;
      clientSecret: string;
      issuer: string;
    };
  };
  nextAuth: {
    secret: string;
  };
}

export const getConfig = (): Config => ({
  auth: {
    keycloak: {
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || '',
      issuer: process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER || '',
    },
  },
  nextAuth: {
    secret: getNextAuthSecret(),
  },
});

const getNextAuthSecret = (): string => {
  return process.env.NEXTAUTH_SECRET || 'default-secret';
};
