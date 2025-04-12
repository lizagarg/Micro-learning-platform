import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Check if user previously set a theme preference
  const storedTheme = localStorage.getItem('theme');
  
  // Default to light mode, or use stored preference, or use system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    // Check system preference as fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update theme when it changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Function to toggle theme
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 