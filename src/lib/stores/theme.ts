import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
  // Get initial theme from localStorage or default to system
  const getInitialTheme = (): Theme => {
    if (!browser) return 'system';

    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  };

  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    if (!browser) return;

    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      effectiveTheme = systemDark ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    root.setAttribute('data-theme', effectiveTheme);

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', effectiveTheme === 'dark' ? '#0a0a0a' : '#ffffff');
    }
  };

  // Listen for system theme changes
  if (browser) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const currentTheme = localStorage.getItem('theme') as Theme;
      if (currentTheme === 'system' || !currentTheme) {
        applyTheme('system');
      }
    });
  }

  return {
    subscribe,
    set: (theme: Theme) => {
      if (browser) {
        localStorage.setItem('theme', theme);
      }
      applyTheme(theme);
      set(theme);
    },
    toggle: () => {
      update(current => {
        const root = document.documentElement;
        const currentEffective = root.getAttribute('data-theme') || 'light';
        const newTheme: Theme = currentEffective === 'dark' ? 'light' : 'dark';

        if (browser) {
          localStorage.setItem('theme', newTheme);
        }
        applyTheme(newTheme);
        return newTheme;
      });
    },
    initialize: () => {
      const theme = getInitialTheme();
      applyTheme(theme);
    }
  };
}

export const theme = createThemeStore();
