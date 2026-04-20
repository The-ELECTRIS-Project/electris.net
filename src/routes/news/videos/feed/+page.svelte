<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';
  import YoutubeCard from '$lib/UI/components/YoutubeCard.svelte';

  let { data } = $props();
  let youtube = $derived(data.youtube);

  const newestPerChannel = $derived.by(() => {
    const map = new Map();
    youtube.videos.forEach(v => {
      if (!map.has(v.channelId)) {
        map.set(v.channelId, v);
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  });

  const liveAndUpcoming = $derived(youtube.videos.filter(v => v.status === 'live' || v.status === 'upcoming'));
  const finishedVideos = $derived(newestPerChannel.filter(v => v.status === 'finished'));

  useHoverConfig([
    {
      selectors: ['.youtube-card'],
      className: 'hovered-youtube-card',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-electro) 40%, var(--color-primary) 60%)'
    }
  ]);
</script>

<div class="videos-page reveal-block visible">
  <div class="page-header">
    <h1>{t('videos.page.title', 'Signal Broadcasts')}</h1>
    <p class="page-intro">
      {t('videos.page.intro', 'The latest transmissions from the ELECTRIS network channels.')}
    </p>
  </div>

  {#if liveAndUpcoming.length > 0}
    <section class="video-section">
      <h2 class="section-title">
        <span class="indicator-dot"></span>
        {t('videos.section.live', 'Live & Upcoming')}
      </h2>
      <div class="video-grid">
        {#each liveAndUpcoming as video}
          <YoutubeCard {video} />
        {/each}
      </div>
    </section>
  {/if}

  {#if finishedVideos.length > 0}
    <section class="video-section">
      <h2 class="section-title">{t('videos.section.latest', 'Latest Uploads')}</h2>
      <div class="video-grid">
        {#each finishedVideos as video}
          <YoutubeCard {video} />
        {/each}
      </div>
    </section>
  {:else if liveAndUpcoming.length === 0}
    <div class="empty-state">
      <p>{t('videos.empty_state', 'No signals found. Please check back later.')}</p>
    </div>
  {/if}

  <div class="page-footer">
    <a href="/" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {t('videos.back_home', 'Back to Base')}
    </a>
  </div>
</div>

<style>
  .reveal-block {
    opacity: 0;
    transform: translateY(2.5rem);
    transition:
      opacity 0.9s ease,
      transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .reveal-block.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .videos-page {
    max-width: 84rem;
    margin: 0 auto;
    padding: 8rem 2rem 6rem;
  }

  .page-header {
    margin-bottom: 4rem;
    text-align: center;
  }

  .page-header h1 {
    font-size: clamp(3rem, 8vw, 6rem);
    margin-bottom: 1rem;
    line-height: 1;
  }

  .page-intro {
    font-size: 1.2rem;
    opacity: 0.8;
    max-width: 40rem;
    margin: 0 auto;
  }

  .video-section {
    margin-bottom: 5rem;
  }

  .section-title {
    font-family: 'Nightcore';
    font-size: 1.2rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 2.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    opacity: 0.9;
  }

  .indicator-dot {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background: #ff4e4e;
    box-shadow: 0 0 1rem #ff4e4e;
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem;
    opacity: 0.7;
    font-size: 1.2rem;
  }

  .page-footer {
    margin-top: 6rem;
    display: flex;
    justify-content: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    font-family: 'Nightcore';
    font-size: 0.9rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    color: inherit;
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  .back-link:hover {
    opacity: 1;
    color: var(--color-electro);
    transform: translateX(-0.5rem);
  }

  .back-link svg {
    width: 1.2rem;
    height: 1.2rem;
  }

  @media (max-width: 1100px) {
    .video-grid {
      gap: 1.5rem;
    }
  }

  @media (max-width: 780px) {
    .video-grid {
      grid-template-columns: 1fr;
    }
    .videos-page {
      padding-top: 6rem;
    }
  }
</style>
