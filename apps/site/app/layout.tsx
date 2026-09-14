import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Prism — one design language, many expressions',
  description:
    "NaniSoft's Ant Design–based design system: tokens, components, blocks, and pages, with docs and an LLM/agent surface.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
