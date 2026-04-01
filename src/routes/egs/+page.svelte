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
  <title>Game Studios | ELECTRIS</title>
</svelte:head>

<div class="hero">
  <h1>{t('egs.hero.title')}</h1>
  <p>{t('egs.hero.slogan')}</p>
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
    font-family: Aileron;
    font-size: 1.5rem;
    margin-top: 10px;
  }

  @media (max-width: 900px) {
    .hero {
      min-height: auto;
      padding: 6.5rem 1rem 3rem;
    }

    .hero h1 {
      font-size: clamp(2.8rem, 11vw, 4rem);
    }

    .hero p {
      font-size: 1.15rem;
      max-width: 32rem;
    }
  }

  @media (max-width: 560px) {
    .hero {
      padding-top: 5.75rem;
    }
  }
</style>
