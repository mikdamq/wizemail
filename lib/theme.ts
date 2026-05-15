export type Theme = 'dark' | 'light';
export const THEME_KEY = 'wizemail-theme';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem(THEME_KEY) as Theme) || 'dark';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

// Inline script string — injected before paint in layout to avoid flash
export const THEME_BOOTSTRAP_SCRIPT = `(function(){var t=localStorage.getItem('${THEME_KEY}')||'dark';document.documentElement.setAttribute('data-theme',t);})();`;
