<script lang="ts">
  import { theme } from '$lib/stores/theme';

  function toggleTheme() {
    theme.toggle();
  }

  // Get current effective theme for icon display
  let isDark = $derived(
    typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') === 'dark'
      : false
  );

  // Update isDark when theme changes
  $effect(() => {
    if (typeof document !== 'undefined') {
      const observer = new MutationObserver(() => {
        isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return () => observer.disconnect();
    }
  });
</script>

<button
  onclick={toggleTheme}
  class="theme-toggle"
  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if isDark}
    <!-- Sun icon for dark mode (click to go light) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  {:else}
    <!-- Moon icon for light mode (click to go dark) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    color: var(--foreground-secondary);
    background: transparent;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .theme-toggle:hover {
    color: var(--foreground);
    background: var(--background-secondary);
    border-color: var(--border-hover);
  }

  .theme-toggle:active {
    transform: scale(0.95);
  }

  .theme-toggle svg {
    transition: transform var(--transition);
  }

  .theme-toggle:hover svg {
    transform: rotate(15deg);
  }
</style>
