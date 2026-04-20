<script lang="ts">
  import type { YoutubeVideo } from '$lib/types/youtube';
  import { onMount } from 'svelte';

  interface Props {
    video: YoutubeVideo;
    big?: boolean;
  }

  let { video, big = false }: Props = $props();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });
</script>

<div class="news-card youtube-card wrap-no-interact-all" class:big-card={big}>
  <div class="news-visual youtube-embed">
    {#if mounted}
      <iframe
        src="https://www.youtube.com/embed/{video.id}"
        title={video.title}
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    {:else}
      <div class="embed-placeholder"></div>
    {/if}
    <div class="news-badge youtube-badge">YouTube</div>
  </div>
  <div class="news-copy">
    <div class="news-meta">
      <span class="news-date">{formatDate(video.publishedAt)}</span>
      <span class="channel-name">{video.channelName}</span>
    </div>
    <h3>{video.title}</h3>
    
    <div class="news-tags">
      {#if video.status === 'live'}
        <span class="status-tag live">LIVE</span>
      {:else if video.status === 'upcoming'}
        <span class="status-tag upcoming">UPCOMING</span>
      {:else}
        <span class="status-tag latest">LATEST</span>
      {/if}
      <span>{video.channelName}</span>
    </div>
  </div>
</div>

<style>
  .youtube-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }

  .big-card {
    grid-column: 1 / -1;
  }

  .youtube-embed {
    background: #000;
    position: relative;
    overflow: hidden;
  }

  .youtube-embed iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .embed-placeholder {
    width: 100%;
    height: 100%;
    background: color-mix(in srgb, var(--surface-base) 80%, black);
  }

  .status-tag.live {
    color: #ff4e4e;
    border-color: color-mix(in srgb, #ff4e4e 40%, transparent) !important;
    background: color-mix(in srgb, #ff4e4e 10%, transparent) !important;
  }

  .status-tag.upcoming {
    color: #4e9cff;
    border-color: color-mix(in srgb, #4e9cff 40%, transparent) !important;
    background: color-mix(in srgb, #4e9cff 10%, transparent) !important;
  }

  .youtube-badge {
    background: #ff0000 !important;
    color: white !important;
  }

  @media (max-width: 780px) {
    .youtube-card {
      grid-template-columns: 1fr;
    }
    .youtube-embed {
      aspect-ratio: 16 / 9;
      min-height: auto;
    }
  }
</style>
