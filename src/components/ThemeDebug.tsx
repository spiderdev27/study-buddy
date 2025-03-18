'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/app/theme-selector';

export function ThemeDebug() {
  const { theme, colorMode, colors } = useTheme();
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Check if debug mode is enabled via URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'theme') {
      setShow(true);
    }
  }, []);
  
  if (!show) return null;
  
  return (
    <div className="theme-debug">
      <div className="mb-2 font-bold">Theme Debug</div>
      <div>Theme: {theme}</div>
      <div>Mode: {colorMode}</div>
      <div className="mt-2 mb-1">Colors:</div>
      
      <div className="theme-debug-item">
        <div className="theme-debug-color" style={{ backgroundColor: colors.primary }}></div>
        <div>primary: {colors.primary}</div>
      </div>
      
      <div className="theme-debug-item">
        <div className="theme-debug-color" style={{ backgroundColor: colors.secondary }}></div>
        <div>secondary: {colors.secondary}</div>
      </div>
      
      <div className="theme-debug-item">
        <div className="theme-debug-color" style={{ backgroundColor: colors.accent }}></div>
        <div>accent: {colors.accent}</div>
      </div>
      
      <div className="theme-debug-item">
        <div className="theme-debug-color" style={{ backgroundColor: colors.background }}></div>
        <div>background: {colors.background}</div>
      </div>
      
      <div className="theme-debug-item">
        <div className="theme-debug-color" style={{ backgroundColor: colors.textPrimary }}></div>
        <div>textPrimary: {colors.textPrimary}</div>
      </div>
      
      <div className="theme-debug-item">
        <div className="theme-debug-color" style={{ backgroundColor: colors.textSecondary }}></div>
        <div>textSecondary: {colors.textSecondary}</div>
      </div>
      
      <div className="mt-2">
        <button 
          className="px-2 py-1 bg-white/20 rounded text-xs mt-2" 
          onClick={() => setShow(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
} 