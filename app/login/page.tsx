'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { errorLogger } from '../utils/errorLogging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { t } = useTranslation();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleLogin = async () => {
    try {
      const result = await signIn('keycloak', {
        callbackUrl: '/',
        redirect: true,
        email: email.trim(),
      });
      console.log('SignIn result:', result);
    } catch (error) {
      console.error('Login error:', error);
      errorLogger.logError(error instanceof Error ? error : new Error('Login failed'));
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t('login.welcome', 'Welcome')}</CardTitle>
          <CardDescription className="text-center">
            {t('login.description', 'Sign in to your account')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email', 'Email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder', 'Enter your email')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t('common.signInWithKeycloak', 'Sign in with Keycloak')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
