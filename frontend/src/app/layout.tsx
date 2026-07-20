import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '../providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'DevFlow AI - AI Powered Developer Workspace',
    template: '%s | DevFlow AI',
  },
  description: 'AI-powered code reviews, real-time collaboration, and project management in one beautiful workspace.',
  keywords: ['AI', 'code review', 'project management', 'developer tools', 'collaboration'],
  authors: [{ name: 'DevFlow AI' }],
  openGraph: {
    title: 'DevFlow AI',
    description: 'The Future of Developer Workspace',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
