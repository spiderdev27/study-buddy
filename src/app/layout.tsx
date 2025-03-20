import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Metadata, Viewport } from 'next';
import { ThemeWrapper } from './ThemeWrapper';
import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Study Buddy | AI-Powered Learning Assistant',
  description: 'Transform your learning experience with AI-powered notes, summaries, flashcards, and more.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2B3AFF',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-text-primary">
        <SessionProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
} 