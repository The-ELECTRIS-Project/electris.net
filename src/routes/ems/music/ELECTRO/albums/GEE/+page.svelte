<script>
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n';

  onMount(() => {
    setTimeout(() => {
      const c = document.querySelector('.circle');
      if (c) c.className = 'circle';
    }, 10);
  });
</script>

<svelte:head>
  <title>GEE | ELECTRIS</title>
</svelte:head>

<div class="hero">
    <h1>When you deserve it all,</h1>
    <h1>It all just always seems to linger.</h1>
</div>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-family: "Redwing";
    font-weight: 400;
    font-size: 5rem;
    padding-top: 39vh;
    min-height: calc(20vh - 25vh);
  }
</style>