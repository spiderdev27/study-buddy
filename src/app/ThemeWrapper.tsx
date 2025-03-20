'use client';

import { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider } from './theme-selector';
import { ThemeDebug } from '@/components/ThemeDebug';

export function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
      enableColorScheme={false}
      storageKey="study-buddy-theme"
    >
      <ThemeProvider>
        {/* Theme selector is now integrated into the Header component */}
        <ThemeDebug />
        {children}
      </ThemeProvider>
    </NextThemesProvider>
  );
} 