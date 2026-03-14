<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';
  import NavBar from '$lib/UI/NavBar.svelte';
  import Cursor from '$lib/UI/Cursor.svelte';
  import Popup from '$lib/Mobile/Popup.svelte';
  import CyberNeotic from '$lib/UI/ThemeEffects/Cyber-Neotic.svelte';
  import Wonderful from '$lib/UI/ThemeEffects/Wonderful.svelte';
  import { theme, colorScheme, applyStyles } from '$lib/stores/theme';
  import { initializeI18n, loadRouteLocale } from '$lib/stores/i18n';
  import '/src/app.base.css';

  onMount(() => {
    const init = async () => {
      await initializeI18n($page.url.pathname);
    };
    init();

    const unsubscribeTheme = theme.subscribe(currentTheme => {
      const currentColorScheme = $colorScheme;
      applyStyles(currentTheme, currentColorScheme);
    });

    const unsubscribeColorScheme = colorScheme.subscribe(currentColorScheme => {
      const currentTheme = $theme;
      applyStyles(currentTheme, currentColorScheme);
    });

    return () => {
      unsubscribeTheme();
      unsubscribeColorScheme();
    };
  });

  afterNavigate(async (navigation) => {
    if (navigation.to) {
      await loadRouteLocale(navigation.to.url.pathname);
    }
  });

</script>

<main data-theme={$theme} data-color-scheme-selected={$colorScheme}>
  <NavBar />
  <Cursor />
  <CyberNeotic />
  <Popup />
  <slot />
</main>