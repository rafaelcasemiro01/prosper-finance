import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Prosper Finance',
  description: 'Sua grana no controle, sem complicação.',
};

// Viewport pela API do Next (evita tag duplicada, que quebrava a escala no iOS).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FBF6F0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // No-flash theme: aplica o tema salvo antes da primeira pintura.
  const themeScript = `(function(){try{var t=localStorage.getItem('pf-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
  return (
    <html lang="pt-BR" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
