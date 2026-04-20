<script lang="ts">
  import type { YoutubeVideo } from '$lib/types/youtube';

  interface Props {
    videos: YoutubeVideo[];
  }

  let { videos }: Props = $props();
</script>

{#if videos.length > 0}
  <div class="live-signal-container">
    {#each videos.slice(0, 1) as video}
      <a href="https://youtube.com/watch?v={video.id}" target="_blank" class="live-signal-bar wrap-no-interact-all">
        <div class="live-indicator">
          <span class="indicator-dot"></span>
          <span class="indicator-text">{video.status === 'live' ? 'LIVE NOW' : 'UPCOMING'}</span>
        </div>
        <div class="live-info">
          <span class="channel">{video.channelName}:</span>
          <span class="title">{video.title}</span>
        </div>
        <div class="live-cta">
          {video.status === 'live' ? 'JOIN STREAM' : 'VIEW DETAILS'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </a>
    {/each}
  </div>
{/if}

<style>
  .live-signal-container {
    width: min(100%, 64rem);
    margin: 0 auto 2.5rem;
    position: relative;
    z-index: 2;
  }

  .live-signal-bar {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.85rem 1.4rem;
    border-radius: 1.25rem;
    background: color-mix(in srgb, var(--surface-elevated) 88%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-electro) 40%, transparent);
    box-shadow: 
      0 0.8rem 2rem rgba(0, 0, 0, 0.12),
      0 0 1.2rem color-mix(in srgb, var(--color-electro) 15%, transparent);
    text-decoration: none;
    color: inherit;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .live-signal-bar:hover {
    transform: translateY(-0.2rem);
    background: color-mix(in srgb, var(--surface-elevated) 96%, transparent);
    border-color: var(--color-electro);
    box-shadow: 
      0 1rem 2.5rem rgba(0, 0, 0, 0.18),
      0 0 1.8rem color-mix(in srgb, var(--color-electro) 25%, transparent);
  }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0.8rem;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0.75rem;
  }

  .indicator-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #ff4e4e;
    animation: live-pulse 1.5s infinite;
  }

  .indicator-text {
    font-family: 'Nightcore';
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    color: #f8f8f8;
  }

  .live-info {
    flex: 1;
    min-width: 0;
    font-size: 1.05rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .channel {
    font-family: 'Redwing';
    font-weight: 700;
    opacity: 0.8;
    white-space: nowrap;
  }

  .title {
    opacity: 0.95;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .live-cta {
    font-family: 'Nightcore';
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--color-electro);
  }

  .live-cta svg {
    width: 1rem;
    height: 1rem;
    transition: transform 0.3s ease;
  }

  .live-signal-bar:hover .live-cta svg {
    transform: translateX(0.25rem);
  }

  @keyframes live-pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.6; }
    100% { transform: scale(1); opacity: 1; }
  }

  @media (max-width: 780px) {
    .live-signal-bar {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.8rem;
    }
    .live-info {
      flex-wrap: wrap;
    }
    .live-cta {
      align-self: flex-end;
    }
  }
</style>
