import type { FormEvent, ReactNode } from 'react';

import { AuthForm, type AuthMode, type AuthProvider } from '../../blocks/auth-form/index.js';
import { cx } from '../../internal/cx.js';

export interface AuthPageProps {
  mode?: AuthMode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  providers?: readonly AuthProvider[];
  footer?: ReactNode;
  aside?: ReactNode;
  header?: ReactNode;
  className?: string;
}

export function AuthPage({ mode = 'sign-in', onSubmit, providers, footer, aside, header, className }: AuthPageProps) {
  return (
    <div className={cx('prism-auth-page', className)} data-prism="auth-page">
      {header}
      <main className="prism-auth-page__main">
        <section className="prism-auth-page__form"><AuthForm mode={mode} onSubmit={onSubmit} providers={providers} footer={footer} /></section>
        {aside ? <aside className="prism-auth-page__aside">{aside}</aside> : null}
      </main>
    </div>
  );
}
