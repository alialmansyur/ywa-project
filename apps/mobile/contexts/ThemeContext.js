import React, { createContext, useContext, useEffect } from 'react';
import { theme, lightColors } from '../constants/AppTheme';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const isDark = false;

  useEffect(() => {
    theme.colors = lightColors;
    theme.isDark = false;
    theme.typography.caption.color = lightColors.textSecondary;
  }, [isDark]);

  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: lightColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
