<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import NavBar from '$lib/UI/NavBar.svelte';
  import Cursor from '$lib/UI/Cursor.svelte';
  import Popup from '$lib/Mobile/Popup.svelte';
  import CyberNeotic from '$lib/UI/ThemeEffects/Cyber-Neotic.svelte';
  import { initializeI18n, loadRouteLocale } from '$lib/stores/i18n.svelte';
  import '/src/app.base.css';

  let { children } = $props();

  onMount(() => {
    const init = async () => {
      await initializeI18n(page.url.pathname);
    };
    init();
  });

  afterNavigate((navigation) => {
    loadRouteLocale(navigation.to?.url.pathname || '');
  });
</script>

<NavBar />
<Cursor />
<Popup />
<CyberNeotic />

<main>
  {@render children()}
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>
