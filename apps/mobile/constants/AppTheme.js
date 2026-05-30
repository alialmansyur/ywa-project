export const lightColors = {
  primary: '#0A8B61',
  primaryDark: '#076D4C',
  primaryLight: '#E6F4EF',
  background: '#F1F5F9', // Slightly gray background for light mode
  surface: '#FFFFFF',    // White card surface
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

export const darkColors = {
  primary: '#0A8B61',
  primaryDark: '#076D4C',
  primaryLight: '#022C1E',
  background: '#0F172A', // Dark navy background
  surface: '#1E293B',    // Darker surface for cards
  text: '#F8FAFC',       // Off-white text
  textSecondary: '#94A3B8',
  border: '#334155',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const borderRadius = {
  sm: 6, md: 10, lg: 16, full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 22, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};

// Initial default theme (will be mutated by ThemeContext for quick global updates, 
// though dynamic Context is preferred)
export const theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  isDark: false,
};
