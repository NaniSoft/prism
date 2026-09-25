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
  landmark?: 'main' | 'region';
  className?: string;
}

export function AuthPage({ mode = 'sign-in', onSubmit, providers, footer, aside, header, landmark = 'main', className }: AuthPageProps) {
  const creating = mode === 'create-account';
  const action = creating ? 'Create account' : 'Sign in';
  const ContentElement = landmark === 'main' ? 'main' : 'div';

  return (
    <div className={cx('prism-auth-page', className)} data-prism="auth-page" data-mode={mode}>
      {header}
      <ContentElement
        className={cx('prism-auth-page__main', !aside && 'prism-auth-page__main--form-only')}
        {...(landmark === 'region' ? { role: 'region', 'aria-label': action } : { 'aria-label': action })}
      >
        <section className="prism-auth-page__form" aria-label={action}>
          <AuthForm mode={mode} onSubmit={onSubmit} providers={providers} footer={footer} />
        </section>
        {aside ? <aside className="prism-auth-page__aside" aria-label="Account context">{aside}</aside> : null}
      </ContentElement>
    </div>
  );
}
