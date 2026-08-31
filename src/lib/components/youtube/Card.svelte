<script lang="ts">
  import { t, i18nState } from '$lib/state/i18n.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import type { YoutubeVideo } from '$lib/types/youtube';
  import {
    formatYoutubeDate,
    formatYoutubeDateTime,
    getYoutubeAspect,
    getYoutubeEmbedUrl,
    getYoutubeMediaDimensions,
    getYoutubeWatchUrl
  } from '$lib/utils/youtube';

  interface Props {
    video: YoutubeVideo;
    big?: boolean;
  }

  let { video, big = false }: Props = $props();

  let locale = $derived(i18nState.currentLocale || undefined);
  let mediaDimensions = $derived(getYoutubeMediaDimensions(video));
  let aspect = $derived(getYoutubeAspect(video));
  let watchUrl = $derived(getYoutubeWatchUrl(video.id));
  let embedUrl = $derived(getYoutubeEmbedUrl(video.id));

  let statusLabel = $derived(
    video.status === 'live'
      ? t('youtube.status.live', 'Live now')
      : video.status === 'upcoming'
        ? t('youtube.status.upcoming', 'Upcoming')
        : t('youtube.status.finished', 'Latest upload')
  );

  let summary = $derived.by(() => {
    if (!video.description) {
      if (video.status === 'live') {
        return `${video.channelName} ${t('youtube.summary.live', 'is live right now.')}`;
      }

      if (video.status === 'upcoming') {
        return `${video.channelName} ${t('youtube.summary.upcoming', 'has this one scheduled.')}`;
      }

      return `${video.channelName} ${t('youtube.summary.finished', 'put this one out most recently.')}`;
    }

    // Extract first paragraph: up to the first empty line (double newline)
    const paragraphs = video.description.split(/\n\s*\n/);
    return paragraphs[0].trim();
  });

  let primaryDetail = $derived.by(() => {
    if (video.status === 'live') {
      return {
        label: t('youtube.label.started', 'Started'),
        value: video.actualStartTime
          ? formatYoutubeDateTime(video.actualStartTime, locale)
          : formatYoutubeDateTime(video.publishedAt, locale)
      };
    }

    if (video.status === 'upcoming') {
      return {
        label: t('youtube.label.scheduled', 'Scheduled'),
        value: video.scheduledStartTime
          ? formatYoutubeDateTime(video.scheduledStartTime, locale)
          : formatYoutubeDateTime(video.publishedAt, locale)
      };
    }

    return {
      label: t('youtube.label.published', 'Published'),
      value: formatYoutubeDate(video.publishedAt, locale)
    };
  });

  let secondaryDetail = $derived.by(() => {
    if (video.status === 'upcoming') {
      return {
        label: t('youtube.label.announced', 'Announced'),
        value: formatYoutubeDate(video.publishedAt, locale)
      };
    }

    return {
      label: t('youtube.label.channel', 'Channel'),
      value: video.channelName
    };
  });

  // CONTENT-DYNAMIC SIZING
  let summaryLength = $derived(summary.length);

  function fitText(node: HTMLElement, params?: { min?: number; max?: number }) {
    const getMin = () => params?.min ?? 14;
    const getMax = () => params?.max ?? 32;

    function fit() {
      const min = getMin();
      const max = getMax();
      node.style.fontSize = `${max}px`;

      if (node.scrollWidth <= node.clientWidth) {
        return;
      }

      let lo = min;
      let hi = max;
      while (hi - lo > 0.25) {
        const mid = (lo + hi) / 2;
        node.style.fontSize = `${mid}px`;
        if (node.scrollWidth <= node.clientWidth) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      node.style.fontSize = `${lo}px`;
    }

    const ro = new ResizeObserver(fit);
    ro.observe(node);
    fit();

    return {
      update(newParams?: { min?: number; max?: number }) {
        params = newParams;
        fit();
      },
      destroy() {
        ro.disconnect();
      }
    };
  }

  useHoverConfig([
    {
      selectors: ['.media-frame'],
      className: 'hovered-home-media-youtube',
      lockPosition: true,
      color: 'color-mix(in srgb, var(--youtube-brand) 72%, var(--accent) 28%)'
    },
    {
      type: ['p'],
      selectors: ['.summary'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: true,
        sentences: false,
        ignorePunctuation: true
      }
    },
    {
      type: ['h3', 'span'],
      selectors: ['.watch-link'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: false,
        ignoreCharacters: false,
        sentences: true
      }
    }
  ]);
</script>

<article
  class="youtube-card"
  class:big-card={big}
  class:portrait={aspect === 'portrait'}
  class:square={aspect === 'square'}
  class:landscape={aspect === 'landscape'}
  style={`--media-width:${mediaDimensions.width}; --media-height:${mediaDimensions.height}; --summary-len:${summaryLength};`}
>
  <div class="card-chassis">
    <div class="media-stack">
      <div class="frame-topline">
        <span class="platform-badge">YouTube</span>
        <span class={`status-badge ${video.status}`}>{statusLabel}</span>
      </div>

      <div class="media-frame">
        <div class="media-clip">
          <iframe
            class="player-frame"
            src={embedUrl}
            title={video.title}
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>

    <div class="content">
      <h3 use:fitText={{ min: 14, max: big ? 36 : 28 }}>{video.title}</h3>
      <p class="summary">{summary}</p>

      <div class="detail-grid">
        <div class="detail-card">
          <span class="detail-label">{primaryDetail.label}</span>
          <strong>{primaryDetail.value}</strong>
        </div>
        <div class="detail-card">
          <span class="detail-label">{secondaryDetail.label}</span>
          <strong>{secondaryDetail.value}</strong>
        </div>
      </div>

      <div class="card-footer">
        <a href={watchUrl} target="_blank" rel="noreferrer" class="watch-link">
          <span>{t('youtube.link.watch', 'Open on YouTube')} →</span>
        </a>
      </div>
    </div>
  </div>
</article>

<style>
  .youtube-card {
    /* YouTube's own red, and the video letterbox behind the player. Both fixed in every theme. */
    --youtube-brand: #ff0000;
    --youtube-accent: #ff4d00;
    --youtube-letterbox: #050608;
    /* Broadcast state reads the same everywhere, so these do not follow the scheme either. */
    --live-signal: #ff4e4e;
    --upcoming-signal: #ff8c00;
    --youtube-surface-base: var(--surface-base, color-mix(in srgb, var(--surface-page) 82%, transparent));
    --youtube-surface-elevated: var(--surface-elevated, color-mix(in srgb, var(--surface-page) 90%, transparent));
    --youtube-border: color-mix(in srgb, var(--youtube-brand) 12%, transparent);
    min-width: 0;
    align-self: start;
    container-type: inline-size;
  }

  .big-card {
    grid-column: 1 / -1;
  }

  .card-chassis {
    position: relative;
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);
    border-radius: var(--radius-2xl);
    border: 1px solid var(--youtube-border);
    overflow: hidden;
    isolation: isolate;
    background:
      radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--youtube-brand) 8%, transparent), transparent 36%),
      linear-gradient(160deg, color-mix(in srgb, var(--youtube-surface-elevated) 96%, transparent), color-mix(in srgb, var(--youtube-surface-base) 98%, transparent));
    box-shadow: var(--shadow-md);
    transition:
      transform var(--duration-slow) var(--ease-out),
      border-color var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .card-chassis::before {
    content: '';
    position: absolute;
    inset: var(--space-3);
    border-radius: calc(var(--radius-2xl) - var(--space-3));
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 8%, transparent);
    pointer-events: none;
  }

  .card-chassis::after {
    content: '';
    position: absolute;
    inset: auto var(--space-4) var(--space-4);
    height: 1px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--youtube-brand) 32%, transparent), transparent);
    opacity: 0.72;
    pointer-events: none;
  }

  .media-stack,
  .content {
    min-width: 0;
  }

  .media-stack {
    display: grid;
    gap: var(--space-3);
    align-content: start;
  }

  .frame-topline,
  .detail-label,
  .watch-link {
    font-family: var(--font-body);
  }

  .frame-topline {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  .platform-badge,
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    line-height: 1;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .platform-badge {
    background: var(--youtube-brand);
    color: var(--text-on-accent);
    box-shadow: 0 0 var(--space-4) color-mix(in srgb, var(--youtube-brand) 24%, transparent);
  }

  .status-badge {
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 22%, transparent);
    background: color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    color: inherit;
  }

  .status-badge.live {
    border-color: color-mix(in srgb, var(--live-signal) 30%, transparent);
    background: color-mix(in srgb, var(--live-signal) 12%, transparent);
    color: color-mix(in srgb, var(--live-signal) 72%, currentColor 28%);
  }

  .status-badge.upcoming {
    border-color: color-mix(in srgb, var(--upcoming-signal) 30%, transparent);
    background: color-mix(in srgb, var(--upcoming-signal) 12%, transparent);
    color: color-mix(in srgb, var(--upcoming-signal) 72%, currentColor 28%);
  }

  .status-badge.finished {
    border-color: color-mix(in srgb, var(--youtube-accent) 26%, transparent);
    background: color-mix(in srgb, var(--youtube-brand) 8%, transparent);
    color: color-mix(in srgb, var(--youtube-brand) 72%, currentColor 28%);
  }

  .media-frame {
    position: relative;
    width: 100%;
    aspect-ratio: var(--media-width) / var(--media-height);
    border-radius: var(--radius-xl);
    border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
    background: var(--youtube-letterbox);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 4%, transparent),
      var(--shadow-md);
    overflow: hidden;
    isolation: isolate;
    clip-path: inset(0 round var(--radius-xl));
    transform: translateZ(0);
  }

  .portrait .media-frame {
    max-width: min(100%, 18rem);
    margin-inline: auto;
  }

  .square .media-frame {
    max-width: min(100%, 22rem);
    margin-inline: auto;
  }

  .media-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    background: var(--youtube-letterbox);
  }

  .player-frame {
    position: absolute;
    inset: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 0;
    background: var(--youtube-letterbox);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    /* Clears the badge row beside it, so both columns start on the same line. */
    padding-top: calc(var(--text-2xs) + var(--space-3) + var(--space-4));
    min-width: 0;
    overflow: hidden;
  }

  h3 {
    margin: 0;
    font-family: var(--font-body);
    line-height: 1.16;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: 100%;
  }

  .summary {
    margin: 0;
    font-family: var(--font-ui);
    font-size: clamp(var(--text-sm), calc(350cqw / (var(--summary-len) + 100)), var(--text-base));
    line-height: 1.68;
    opacity: 0.9;
    white-space: pre-line;
    display: -webkit-box;
    line-clamp: 4;
    box-orient: vertical;
    overflow: hidden;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    margin-top: auto;
  }

  .detail-card {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 14%, transparent);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--youtube-brand) 7%, transparent), transparent 60%),
      color-mix(in srgb, var(--youtube-surface-elevated) 94%, transparent);
    min-width: 0;
  }

  .detail-label {
    font-size: var(--text-2xs);
    line-height: 1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.72;
  }

  .detail-card strong {
    font-family: var(--font-ui);
    font-size: var(--text-base);
    line-height: 1.45;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-top: var(--space-1);
  }

  .watch-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    color: color-mix(in srgb, var(--youtube-brand) 82%, currentColor 18%);
    text-decoration: none;
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition:
      color var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
  }

  .watch-link:hover {
    transform: translateX(0.12rem);
  }

  @media (min-width: 860px) {
    .big-card.landscape .card-chassis {
      grid-template-columns: minmax(0, 1.05fr) minmax(19rem, 0.95fr);
      align-items: stretch;
    }

    .big-card.portrait .card-chassis,
    .big-card.square .card-chassis {
      grid-template-columns: minmax(15rem, 22rem) minmax(0, 1fr);
      align-items: start;
    }

    .big-card.portrait .media-frame,
    .big-card.square .media-frame {
      max-width: none;
      margin-inline: 0;
    }
  }

  @media (max-width: 780px) {
    .card-chassis {
      border-radius: var(--radius-xl);
    }

    .media-frame {
      border-radius: var(--radius-lg);
      clip-path: inset(0 round var(--radius-lg));
    }

    .media-clip {
      clip-path: none;
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .card-chassis {
      padding: var(--space-4);
    }
  }

  :global([data-theme="cyber-neotic"]) .card-chassis {
    box-shadow:
      var(--shadow-lg),
      0 0 var(--space-5) color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
  }

  :global([data-theme="cyber-neotic"]) .media-frame {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 8%, transparent),
      var(--shadow-md),
      0 0 var(--space-4) color-mix(in srgb, var(--youtube-brand) 14%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .detail-card,
  :global([data-theme="cyber-neotic"]) .status-badge {
    box-shadow: inset 0 0 var(--space-3) color-mix(in srgb, var(--youtube-brand) 4%, transparent);
  }
</style>
