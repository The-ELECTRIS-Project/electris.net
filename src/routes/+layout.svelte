<script lang="ts">
  import '/src/app.base.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import NavBar from '$lib/UI/NavBar.svelte';
  import Cursor from '$lib/UI/Cursor.svelte';
  import Popup from '$lib/Mobile/Popup.svelte';
  import CyberNeotic from '$lib/UI/ThemeEffects/Cyber-Neotic.svelte';
  import { initializeI18n, loadRouteLocale } from '$lib/stores/i18n.svelte';

  let { children } = $props();

  const defaultMeta = {
    title: 'ELECTRIS',
    description: 'What you create is YOURS.',
    image: 'https://electris.net/media/ELECTRIS-Embed-Banner.png',
    url: 'https://electris.net/',
    type: 'website',
    twitterCard: 'summary_large_image'
  };

  let ogTitle = $derived(page.data?.meta?.title ?? defaultMeta.title);
  let ogDescription = $derived(page.data?.meta?.description ?? defaultMeta.description);
  let ogImage = $derived(page.data?.meta?.image ?? defaultMeta.image);
  let ogUrl = $derived(page.data?.meta?.url ?? defaultMeta.url);
  let ogType = $derived(page.data?.meta?.type ?? defaultMeta.type);
  let twitterCard = $derived(page.data?.meta?.twitterCard ?? defaultMeta.twitterCard);

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

<svelte:head>
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content={ogUrl} />
  {#if ogImage}
    <meta property="og:image" content={ogImage} />
  {/if}
  <meta property="og:type" content={ogType} />
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={ogDescription} />
  {#if ogImage}
    <meta name="twitter:image" content={ogImage} />
  {/if}
</svelte:head>

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
