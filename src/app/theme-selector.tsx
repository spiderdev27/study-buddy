"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

// Define our theme types and color mode
type ThemeType = 'default' | 'dark-academia' | 'nature' | 'minimalist';
type ColorMode = 'dark' | 'light';

// Theme color options - Dark Mode
const darkThemeColors = {
  'default': {
    name: 'Futuristic',
    primary: "#2B3AFF",      // Electric Blue
    secondary: "#8C1AFE",    // Vivid Purple
    accent: "#00F5E9",       // Neon Turquoise
    background: "#050515",   // Rich Black
    cardBg: "rgba(15, 20, 40, 0.6)",
    textPrimary: "#FFFFFF",  // White
    textSecondary: "#E0E0FF" // Light Blue
  },
  'dark-academia': {
    name: 'Dark Academia',
    primary: "#8B7355",      // Coffee Brown
    secondary: "#4B382A",    // Dark Oak
    accent: "#D4C1A1",       // Aged Parchment
    background: "#1C1713",   // Deep Mahogany
    cardBg: "rgba(43, 33, 24, 0.6)",
    textPrimary: "#FFFFFF",  // White
    textSecondary: "#E6DED1" // Light Tan
  },
  'nature': {
    name: 'Nature',
    primary: "#3E7C17",      // Forest Green
    secondary: "#125C13",    // Deep Green
    accent: "#F8CB2E",       // Sunshine Yellow
    background: "#081C15",   // Dark Forest
    cardBg: "rgba(14, 64, 39, 0.6)",
    textPrimary: "#FFFFFF",  // White
    textSecondary: "#D7F9D0" // Light Green
  },
  'minimalist': {
    name: 'Minimalist',
    primary: "#383838",      // Dark Gray
    secondary: "#777777",    // Medium Gray
    accent: "#F2F2F2",       // Light Gray
    background: "#0A0A0A",   // Near Black
    cardBg: "rgba(20, 20, 20, 0.6)",
    textPrimary: "#FFFFFF",  // White
    textSecondary: "#CCCCCC" // Light Gray
  }
};

// Theme color options - Light Mode
const lightThemeColors = {
  'default': {
    name: 'Futuristic',
    primary: "#2B3AFF",      // Electric Blue
    secondary: "#8C1AFE",    // Vivid Purple
    accent: "#00D9CF",       // Deeper Turquoise (for better contrast)
    background: "#F5F5FF",   // Very Light Blue
    cardBg: "rgba(240, 240, 255, 0.8)",
    textPrimary: "#050515",  // Dark Blue/Black
    textSecondary: "#4A4A7C" // Medium Blue-Gray
  },
  'dark-academia': {
    name: 'Dark Academia',
    primary: "#6D573D",      // Darker Coffee Brown
    secondary: "#4B382A",    // Dark Oak
    accent: "#B09978",       // Darker Parchment
    background: "#F5F2ED",   // Cream
    cardBg: "rgba(245, 242, 237, 0.8)",
    textPrimary: "#1C1713",  // Deep Mahogany
    textSecondary: "#594A3A" // Medium Brown
  },
  'nature': {
    name: 'Nature',
    primary: "#2A6A10",      // Deeper Forest Green
    secondary: "#125C13",    // Deep Green
    accent: "#E8B60F",       // Deeper Yellow
    background: "#F0F7F0",   // Light Mint Green
    cardBg: "rgba(240, 247, 240, 0.8)",
    textPrimary: "#081C15",  // Dark Forest
    textSecondary: "#2E542A" // Medium Green
  },
  'minimalist': {
    name: 'Minimalist',
    primary: "#383838",      // Dark Gray
    secondary: "#777777",    // Medium Gray
    accent: "#A0A0A0",       // Medium-Light Gray
    background: "#F8F8F8",   // Off-White
    cardBg: "rgba(248, 248, 248, 0.8)",
    textPrimary: "#0A0A0A",  // Near Black
    textSecondary: "#555555" // Medium-Dark Gray
  }
};

// Context for theme state
type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  colors: typeof darkThemeColors.default;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('default');
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [colors, setColors] = useState(lightThemeColors.default);

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Update colors when theme or color mode changes
  useEffect(() => {
    const themeColors = colorMode === 'dark' ? darkThemeColors : lightThemeColors;
    setColors(themeColors[theme]);
    
    // Helper function to apply a CSS variable to both document root and body
    const setColorVar = (name: string, value: string) => {
      document.documentElement.style.setProperty(name, value);
      document.body.style.setProperty(name, value);
    };
    
    // Apply theme colors to CSS variables
    setColorVar('--color-primary', themeColors[theme].primary);
    setColorVar('--color-secondary', themeColors[theme].secondary);
    setColorVar('--color-accent', themeColors[theme].accent);
    setColorVar('--color-background', themeColors[theme].background);
    setColorVar('--color-card-bg', themeColors[theme].cardBg);
    setColorVar('--color-text-primary', themeColors[theme].textPrimary);
    setColorVar('--color-text-secondary', themeColors[theme].textSecondary);
    
    // Set RGB versions of the colors
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    };
    
    setColorVar(
      '--color-primary-rgb', 
      hexToRgb(themeColors[theme].primary) || '43, 58, 255'
    );
    setColorVar(
      '--color-secondary-rgb', 
      hexToRgb(themeColors[theme].secondary) || '140, 26, 254'
    );
    setColorVar(
      '--color-accent-rgb', 
      hexToRgb(themeColors[theme].accent) || '0, 245, 233'
    );
    
    // Clear any existing theme classes
    const themeClasses = ['theme-default', 'theme-dark-academia', 'theme-nature', 'theme-minimalist'];
    const modeClasses = ['mode-light', 'mode-dark'];
    
    // Remove all possible theme and mode classes
    document.documentElement.classList.remove(...themeClasses, ...modeClasses);
    
    // Add the new theme and mode classes
    document.documentElement.classList.add(`theme-${theme}`, `mode-${colorMode}`);
    
    // Force a re-render of critical elements by toggling a class briefly
    document.documentElement.classList.add('theme-updating');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-updating');
    }, 50);
    
    // Store the theme and color mode preference
    localStorage.setItem('studyBuddy-theme', theme);
    localStorage.setItem('studyBuddy-colorMode', colorMode);
  }, [theme, colorMode]);
  
  // Load saved theme preferences on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('studyBuddy-theme') as ThemeType;
    const savedColorMode = localStorage.getItem('studyBuddy-colorMode') as ColorMode;
    
    if (savedTheme && Object.keys(darkThemeColors).includes(savedTheme)) {
      setTheme(savedTheme);
    }
    
    if (savedColorMode && (savedColorMode === 'dark' || savedColorMode === 'light')) {
      setColorMode(savedColorMode);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colorMode, setColorMode, colors, toggleColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme Selector Component
export function ThemeSelector() {
  const { theme, setTheme, colorMode, toggleColorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const themeColors = colorMode === 'dark' ? darkThemeColors : lightThemeColors;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {/* Dark/Light Mode Toggle */}
      <button
        onClick={toggleColorMode}
        className="bg-bg-card backdrop-blur-md p-2 rounded-full border border-white/10 shadow-glow"
        aria-label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {colorMode === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
      
      {/* Theme Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-bg-card backdrop-blur-md p-2 rounded-full border border-white/10 shadow-glow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" />
        </svg>
      </button>
      
      <AnimatedPanel isOpen={isOpen}>
        <div className="p-4 bg-bg-card backdrop-blur-md rounded-lg border border-white/10 shadow-glow w-64">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gradient">Theme</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            {Object.entries(themeColors).map(([themeKey, themeData]) => (
              <button
                key={themeKey}
                onClick={() => {
                  setTheme(themeKey as ThemeType);
                  setIsOpen(false);
                }}
                className={`w-full p-3 rounded-lg transition-all flex items-center ${
                  theme === themeKey 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'bg-white/5 border border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex gap-2 mr-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themeData.primary }}></div>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themeData.secondary }}></div>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themeData.accent }}></div>
                </div>
                <span className="text-text-primary">{themeData.name}</span>
              </button>
            ))}
          </div>
        </div>
      </AnimatedPanel>
    </div>
  );
}

function AnimatedPanel({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`absolute top-12 right-0 ${isOpen ? 'block' : 'hidden pointer-events-none'}`}
    >
      {children}
    </motion.div>
  );
} 