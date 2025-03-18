import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { ThemeWrapper } from './ThemeWrapper';
import SessionProvider from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Study Buddy | AI-Powered Learning Assistant',
  description: 'Transform your learning experience with AI-powered notes, summaries, flashcards, and more.',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2B3AFF',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="theme-default mode-light">
      <body className="bg-background text-text-primary">
        <SessionProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </SessionProvider>
      </body>
    </html>
  );
} 