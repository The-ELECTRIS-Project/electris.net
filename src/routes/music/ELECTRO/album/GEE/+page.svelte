<script>
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';

  onMount(() => {
    setTimeout(() => {
      const c = document.querySelector('.circle');
      if (c) c.className = 'circle';
    }, 10);
  });
</script>

<svelte:head>
  <title>GEE | ELECTRO | ELECTRIS</title>
</svelte:head>

<div class="hero">
    <h1>{t('gee.title.p1', 'When you deserve it all,')}</h1>
    <h1>{t('gee.title.p2', 'It all just always seems to linger.')}</h1>
</div>

<style>
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-family: var(--font-body);
    font-weight: 400;
    font-size: var(--display-lg);
    padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
  }
</style>