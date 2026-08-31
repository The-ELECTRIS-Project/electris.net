<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import { artists } from '$lib/data/music/artists';

  useHoverConfig([
    {
      type: [ 'img' ],
      selectors: ['.artist-avatar'],
      className: 'hovered-avatar',
      lockPosition: true,
      dynamicSizeOffset: 0.3
    }
  ]);

  onMount(() => {
    setTimeout(() => {
      const c = document.querySelector('.circle');
      if (c) c.className = 'circle';
    }, 10);
  });
</script>

<svelte:head>
  <title>Music | ELECTRIS</title>
</svelte:head>

<div class="hero">
    <h1>{t('ems.music.hero.title')}</h1>
    <p class="slogan">{t('ems.music.hero.slogan')}</p>
  </div>

<div class="artists-section">
  <div class="artists-grid">
    {#each artists as artist}
      <a href="/music/{artist.slug}" class="artist-card">
        <img class="artist-avatar" src={artist.avatar} alt={artist.name} />
        <span class="artist-name" style="font-family: {artist.artistFont || 'inherit'}">{artist.name}</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .hero {
    min-height: var(--space-8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: var(--layout-page-top);
    text-align: center;
  }

  .hero h1 {
    padding-top: var(--space-3);
    font-family: var(--font-display);
    font-size: var(--display-md);
    margin: 0;
  }

  .slogan {
    font-size: var(--text-lg);
    margin-top: var(--space-3);
    opacity: 0.8;
    font-style: italic;
  }

  .artists-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-8) 0;
  }

  .artists-grid {
    display: flex;
    gap: 6.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .artist-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: inherit;
    transition: transform var(--duration-slow) var(--ease-spring);
  }

  .artist-card:hover {
    transform: translateY(-0.7rem) scale(1.05);
  }

  .artist-avatar {
    width: 12rem;
    height: 12rem;
    border-radius: var(--radius-round);
    overflow: hidden;
    border: 3px solid var(--accent);
    margin-bottom: var(--space-5);
    box-shadow: var(--shadow-md);
  }

  .artist-card:hover .artist-avatar {
    border-color: var(--text-secondary);
  }

  .artist-name {
    font-weight: bold;
    font-size: var(--text-2xl);
    letter-spacing: 0.06em;
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .hero {
      padding-top: calc(var(--layout-page-top) + var(--space-4));
    }

    .slogan {
      font-size: var(--text-md);
      padding: 0 var(--space-4);
      max-width: 34rem;
    }

    .artists-section {
      padding: var(--space-7) var(--space-4) var(--space-8);
    }

    .artists-grid {
      gap: var(--space-5);
    }

    .artist-avatar {
      width: 9rem;
      height: 9rem;
    }

    .artist-name {
      font-size: var(--text-xl);
    }
  }

  @media (max-width: 560px) {
    .artists-grid {
      gap: var(--space-4);
    }

    .artist-card {
      width: calc(50% - var(--space-2));
    }

    .artist-avatar {
      width: 100%;
      height: auto;
      aspect-ratio: 1;
    }
  }
</style>
