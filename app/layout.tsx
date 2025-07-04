import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './globals.css';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Seazr',
  description:
    "Transform your boat's existing sensors into smart IoT devices with Seazr. Monitor your vessel from anywhere in the world.",
  keywords: [
    'boat monitoring',
    'marine IoT',
    'smart boat',
    'vessel monitoring',
    'boat sensors',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      {/* <head>
        <link rel="manifest" href="public/manifest.js" />
      </head> */}
      <meta name='apple-mobile-web-app-title' content='Seazr' />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Toaster position='top-center' />
      </body>
    </html>
  );
}
