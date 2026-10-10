import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

const THEME_STORAGE_KEY = 'omnihub.theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [theme, setThemeState] = useLocalStorage(THEME_STORAGE_KEY, prefersDark ? 'dark' : 'light');

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch {
      // Ignore DOM errors in non-browser environments
    }
  }, [theme]);

  const setTheme = useCallback(
    (nextTheme) => {
      setThemeState(nextTheme === 'dark' ? 'dark' : 'light');
    },
    [setThemeState],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, [setThemeState]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      isDark: false,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}

export default ThemeContext;
