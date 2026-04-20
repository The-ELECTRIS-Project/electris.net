<script lang="ts">
  import '/src/app.base.css';
  import '/src/app.cyber.css';
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
    description: 'ELECTRIS, where the art matters more than the revenue.',
    image: 'https://electris.net/media/ELECTRIS-Embed-Banner.png',
    url: 'https://electris.net/',
    type: 'website',
    twitterCard: 'summary_large_image'
  };

  const resolveAbsoluteUrl = (value: string, fallbackOrigin: string) => {
    try {
      return new URL(value, fallbackOrigin).href;
    } catch {
      return value;
    }
  };

  let ogTitle = $derived(page.data?.meta?.title || defaultMeta.title);
  let ogDescription = $derived(page.data?.meta?.description || defaultMeta.description);
  let ogImage = $derived(
    resolveAbsoluteUrl(
      page.data?.meta?.image || page.data?.post?.coverImage || defaultMeta.image,
      page.url.origin
    )
  );
  let ogUrl = $derived(
    resolveAbsoluteUrl(
      page.data?.meta?.url || defaultMeta.url,
      page.url.origin
    )
  );
  let ogType = $derived(page.data?.meta?.type || defaultMeta.type);
  let twitterCard = $derived(page.data?.meta?.twitterCard || defaultMeta.twitterCard);

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
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:secure_url" content={ogImage} />
  <meta property="og:type" content={ogType} />
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={ogDescription} />
  <meta name="twitter:image" content={ogImage} />
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
