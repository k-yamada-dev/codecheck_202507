'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleUIError } from '@/lib/errors/uiHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || t('forgotPassword.error'));
      }
      setSent(true);
    } catch (error) {
      handleUIError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t('forgotPassword.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('forgotPassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center text-green-600 space-y-4">
              <div>{t('forgotPassword.sent')}</div>
              <a
                href="/login"
                className="inline-block text-sm text-blue-600 hover:underline"
              >
                {t('forgotPassword.backToLogin')}
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email', 'Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? t('forgotPassword.sending')
                  : t('forgotPassword.send')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
