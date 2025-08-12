'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { handleUIError } from '@/lib/errors/uiHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/PasswordInput';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const result = await signIn('credentials', {
        redirect: false,
        idToken,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
    } catch (error) {
      handleUIError(error);
    } finally {
      setIsLoading(false);
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
            <div className="space-y-2">
              <Label htmlFor="password">{t('common.password', 'Password')}</Label>
              <PasswordInput
                id="password"
                placeholder="********"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                t('common.signIn', 'Sign In')
              )}
            </Button>
            <div className="mt-2 text-center">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                {t('forgotPassword.link', 'パスワードをお忘れですか？')}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
