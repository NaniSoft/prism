import { AuthForm } from '@nanisoft/prism-ui/blocks/auth-form';

export default function AuthFormDemo() {
  return <AuthForm mode="sign-in" footer={<>New to NaniSoft? <a href="#create">Create an account</a></>} />;
}
