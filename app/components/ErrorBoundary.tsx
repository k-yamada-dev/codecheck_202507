'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { errorLogger } from '../utils/errorLogging';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラーログを記録
    errorLogger.logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  const { t } = useTranslation();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              {t('error.somethingWentWrong', 'エラーが発生しました')}
            </h2>

            <p className="text-muted-foreground">
              {error?.message || t('error.unknownError', '不明なエラーが発生しました')}
            </p>

            {isDevelopment && error && (
              <div className="w-full mt-4">
                <div className="rounded bg-muted p-4 text-left overflow-auto">
                  <pre className="text-xs text-muted-foreground">
                    <code>{error.stack}</code>
                  </pre>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('error.reloadPage', 'ページを再読み込み')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundary;
