<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n.svelte';

  onMount(() => {
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };

    setTimeout(cursorReset, 10);
  });
</script>

<svelte:head>
  <title>ELECTRIS Game Studios</title>
</svelte:head>

<div class="hero">
  <h1>{t('egs.hero.title', 'ELECTRIS Game Studios')}</h1>
  <p>{t('egs.hero.slogan', "Life is like a game, So let's play")}</p>
</div>
  
<style>
  .hero {
    min-height: calc(20vmin - 25vmin);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 80px;
    text-align: center;
  }

  .hero h1 {
    padding-top: 1vmin;
    font-family: 'Letric';
    font-size: 4rem;
    margin: 0;
  }

  .hero p {
    font-family: sans-serif;
    font-size: 1.5rem;
    margin-top: 10px;
  }
</style>