import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

export type PasswordInputProps = React.ComponentProps<typeof Input>;

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative w-full">
      <Input {...props} type={show ? 'text' : 'password'} autoComplete="current-password" />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-opacity"
        aria-label={show ? 'パスワードを隠す' : 'パスワードを表示'}
        aria-pressed={show}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
