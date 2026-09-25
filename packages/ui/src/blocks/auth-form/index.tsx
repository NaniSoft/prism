'use client';

import type { FormEvent, ReactNode } from 'react';

import { Button } from '../../components/button/index.js';
import { Checkbox } from '../../components/checkbox/index.js';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../components/field/index.js';
import { Input } from '../../components/input/index.js';
import { Heading, Text } from '../../components/typography/index.js';
import { cx } from '../../internal/cx.js';

export type AuthMode = 'sign-in' | 'create-account';

export interface AuthProvider {
  label: string;
  icon?: ReactNode;
}

export interface AuthFormProps {
  mode?: AuthMode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  providers?: readonly AuthProvider[];
  submitLabel?: string;
  footer?: ReactNode;
  className?: string;
}

export function AuthForm({ mode = 'sign-in', onSubmit, providers = [], submitLabel, footer, className }: AuthFormProps) {
  const creating = mode === 'create-account';
  return (
    <form className={cx('prism-auth-form', className)} onSubmit={onSubmit} data-prism="auth-form">
      <div className="prism-auth-form__intro">
        <Heading level={1} size="lg">{creating ? 'Create your account' : 'Welcome back'}</Heading>
        <Text variant="secondary">{creating ? 'Start building with one NaniSoft account.' : 'Sign in to continue to your workspace.'}</Text>
      </div>

      {providers.length > 0 ? (
        <div className="prism-auth-form__providers">
          {providers.map((provider) => <Button key={provider.label} type="button" iconStart={provider.icon}>{provider.label}</Button>)}
        </div>
      ) : null}
      {providers.length > 0 ? <div className="prism-auth-form__rule"><span>or use email</span></div> : null}

      {creating ? (
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input name="name" autoComplete="name" required />
        </Field>
      ) : null}

      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input name="email" type="email" autoComplete="email" required />
        <FieldDescription>Use the address connected to your NaniSoft account.</FieldDescription>
        <FieldError match="valueMissing">Enter your email address.</FieldError>
      </Field>

      <Field>
        <FieldLabel>Password</FieldLabel>
        <Input name="password" type="password" autoComplete={creating ? 'new-password' : 'current-password'} minLength={8} required />
        {creating ? <FieldDescription>Use at least 8 characters.</FieldDescription> : null}
        <FieldError match="tooShort">Use at least 8 characters.</FieldError>
      </Field>

      <div className="prism-auth-form__options">
        <Checkbox name="remember" label="Keep me signed in" defaultChecked />
      </div>

      <Button type="submit" variant="primary" size="lg" className="prism-auth-form__submit">
        {submitLabel ?? (creating ? 'Create account' : 'Sign in')}
      </Button>
      {footer ? <div className="prism-auth-form__footer">{footer}</div> : null}
    </form>
  );
}
