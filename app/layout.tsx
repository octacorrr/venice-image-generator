import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Venice Image Generator',
  description: 'AI Image Generator powered by Venice.ai',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}