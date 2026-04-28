<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n.svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';
  import { artists } from '$lib/data/music/artists';

  useHoverConfig([
    {
      type: [ 'img' ],
      selectors: ['.artist-avatar'],
      className: 'hovered-avatar',
      lockPosition: true,
      borderRadius: 50,
      positionOffset: { x: 0.09, y: -0.1 }
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
      <a href="/ems/music/{artist.slug}" class="artist-card">
        <img class="artist-avatar" src={artist.avatar} alt={artist.name} />
        <span class="artist-name" style="font-family: {artist.artistFont || 'inherit'}">{artist.name}</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .hero {
    min-height: 5vmin;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 6vmin;
    text-align: center;
  }

  .hero h1 {
    padding-top: 1vmin;
    font-family: 'Letric';
    font-size: 4rem;
    margin: 0;
  }

  .slogan {
    font-size: 1.2rem;
    margin-top: 1vmin;
    opacity: 0.8;
    font-style: italic;
  }

  .artists-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5vmin 0;
  }

  .artists-grid {
    display: flex;
    gap: 8.85vmin;
    justify-content: center;
    flex-wrap: wrap;
  }

  .artist-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: inherit;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .artist-card:hover {
    transform: translateY(-10px) scale(1.05);
  }

  .artist-avatar {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid var(--accent, #f65901);
    margin-bottom: 2vmin;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .artist-card:hover .artist-avatar {
    border-color: #fff;
  }

  .artist-name {
    font-weight: bold;
    font-size: 1.8rem;
    letter-spacing: 0.1rem;
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .hero {
      padding-top: 6.5rem;
    }

    .hero h1 {
      font-size: clamp(2.8rem, 11vw, 4rem);
    }

    .slogan {
      font-size: 1.1rem;
      padding: 0 1rem;
      max-width: 34rem;
    }

    .artists-section {
      padding: 3rem 1rem 4rem;
    }

    .artists-grid {
      gap: 1.5rem;
    }

    .artist-avatar {
      width: 9rem;
      height: 9rem;
    }

    .artist-name {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 560px) {
    .artists-grid {
      gap: 1rem;
    }

    .artist-card {
      width: calc(50% - 0.5rem);
    }

    .artist-avatar {
      width: 100%;
      height: auto;
      aspect-ratio: 1;
    }
  }
</style>
