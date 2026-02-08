<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n';

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
  <title>Reincarnated Creativity | ELECTRIS</title>
  <meta name="description" content="The process in which a creator brings to life an idea based on previous work(s), whether their own or someone else's, whether new or old, with a unique spin, combined with their own idea(s) to create something entirely new. Therefore, the idea(s), of which new creation came from, are reincarnated." />
</svelte:head>

<div class="dictionary-page">
  <div class="term-container">
    <header class="term-header">
      <h1>Reincarnated Creativity</h1>
    </header>
    <section class="definition">
      <p>The process in which a creator brings to life an idea based on previous work(s), whether their own or someone else's, whether new or old, with a unique spin, combined with their own idea(s) to create something entirely new. Therefore, the idea(s), of which new creation came from, are reincarnated.</p>
    </section>
  </div>
  <footer class="term-footer">
    <p><a href="/dictionary">ELECTRIS Dictionary</a></p>
  </footer>
</div>

<style>
  .dictionary-page {
    min-height: 100vh;
    background-color: #131615;
    color: #f65901;
    min-height: 100vh;
    padding: 2rem;
    padding-top: 6vh;
    padding-right: 2vh;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
  }

  .term-header h1 {
    font-size: 3rem;
    margin-bottom: 1.5vh;
    text-align: left;
    padding-right: 17vh;
  }

  .term-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
  }

  .definition {
    max-width: 800px;
    margin: 0 auto;
    background-color: #222;
    padding: 2vh;
    border-radius: 8px;
    font-size: 1.2rem;
    line-height: 1.6;
  }

  .term-footer {
    position: column;
    text-align: center;
    margin-top: auto;
    font-size: 0.9rem;
    color: #aaa;
  }
</style>
