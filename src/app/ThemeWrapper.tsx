'use client';

import { ReactNode } from 'react';
import { ThemeProvider, ThemeSelector } from './theme-selector';
import { ThemeDebug } from '@/components/ThemeDebug';

export function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeSelector />
      <ThemeDebug />
      {children}
    </ThemeProvider>
  );
} 