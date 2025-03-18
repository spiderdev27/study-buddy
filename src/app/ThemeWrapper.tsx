'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-selector';
import { ThemeDebug } from '@/components/ThemeDebug';

export function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {/* Theme selector is now integrated into the Header component */}
      <ThemeDebug />
      {children}
    </ThemeProvider>
  );
} 