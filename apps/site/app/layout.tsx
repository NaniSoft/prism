import { Archivo, JetBrains_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const archivo = Archivo({
  subsets: ['latin'],
  // The width axis IS the refraction (ADR-0001) — wght comes implicitly.
  axes: ['wdth'],
  variable: '--font-archivo',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Prism — one design language, many expressions',
  description:
    "NaniSoft's Ant Design–based design system: tokens, components, blocks, and pages, with docs and an LLM/agent surface.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${jetbrains.variable}`}
        style={{ margin: 0, fontFamily: 'var(--font-archivo), sans-serif' }}
      >
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
