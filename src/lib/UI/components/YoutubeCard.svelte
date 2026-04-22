<script lang="ts">
  import { i18nState } from '$lib/stores/i18n.svelte';
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
    video.status === 'live' ? 'Live now' : video.status === 'upcoming' ? 'Upcoming' : 'Latest upload'
  );

  let summary = $derived.by(() => {
    if (!video.description) {
      if (video.status === 'live') {
        return `${video.channelName} is live right now, with the player kept directly in the card so you can watch without leaving the page.`;
      }

      if (video.status === 'upcoming') {
        return `${video.channelName} already has this stream scheduled, and the player frame stays shaped for the actual broadcast instead of forcing a generic shell.`;
      }

      return `${video.channelName}'s newest upload is playable right here, while the layout still stays clean for long titles and unusual formats.`;
    }

    // Extract first paragraph: up to the first empty line (double newline)
    const paragraphs = video.description.split(/\n\s*\n/);
    return paragraphs[0].trim();
  });

  let primaryDetail = $derived.by(() => {
    if (video.status === 'live') {
      return {
        label: 'Started',
        value: video.actualStartTime
          ? formatYoutubeDateTime(video.actualStartTime, locale)
          : formatYoutubeDateTime(video.publishedAt, locale)
      };
    }

    if (video.status === 'upcoming') {
      return {
        label: 'Scheduled',
        value: video.scheduledStartTime
          ? formatYoutubeDateTime(video.scheduledStartTime, locale)
          : formatYoutubeDateTime(video.publishedAt, locale)
      };
    }

    return {
      label: 'Published',
      value: formatYoutubeDate(video.publishedAt, locale)
    };
  });

  let secondaryDetail = $derived.by(() => {
    if (video.status === 'upcoming') {
      return {
        label: 'Announced',
        value: formatYoutubeDate(video.publishedAt, locale)
      };
    }

    return {
      label: 'Channel',
      value: video.channelName
    };
  });

  // CONTENT-DYNAMIC SIZING
  // We calculate length to help CSS scale the font
  let titleLength = $derived(video.title.length);
  let summaryLength = $derived(summary.length);
</script>

<article
  class="youtube-card wrap-no-interact-all"
  class:big-card={big}
  class:portrait={aspect === 'portrait'}
  class:square={aspect === 'square'}
  class:landscape={aspect === 'landscape'}
  style={`--media-width:${mediaDimensions.width}; --media-height:${mediaDimensions.height}; --title-len:${titleLength}; --summary-len:${summaryLength};`}
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
      <div class="meta-strip">
        <span class="channel-pill">{video.channelName}</span>
        <span class="signal-pill">{video.status === 'live' ? 'Signal active' : video.status === 'upcoming' ? 'Signal queued' : 'Signal received'}</span>
      </div>

      <h3>{video.title}</h3>
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
          <span>Open on YouTube</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</article>

<style>
  .youtube-card {
    --youtube-brand: #ff0000;
    --youtube-brand-deep: #c40000;
    --youtube-accent: #ff4d00; /* Blood Orange */
    --youtube-surface-base: var(--surface-base, color-mix(in srgb, var(--bg-body) 82%, transparent));
    --youtube-surface-elevated: var(--surface-elevated, color-mix(in srgb, var(--bg-body) 90%, transparent));
    --youtube-border: color-mix(in srgb, var(--youtube-brand) 12%, transparent);
    --youtube-border-strong: color-mix(in srgb, var(--youtube-brand) 34%, var(--youtube-accent) 24%);
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
    gap: clamp(1rem, 2.2vw, 1.35rem);
    padding: clamp(1rem, 2.4vw, 1.45rem);
    border-radius: 2rem;
    border: 1px solid var(--youtube-border);
    overflow: hidden;
    isolation: isolate;
    background:
      radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--youtube-brand) 8%, transparent), transparent 36%),
      linear-gradient(160deg, color-mix(in srgb, var(--youtube-surface-elevated) 96%, transparent), color-mix(in srgb, var(--youtube-surface-base) 98%, transparent));
    box-shadow: 0 1.3rem 3rem rgba(0, 0, 0, 0.15);
    transition:
      transform 0.35s ease,
      border-color 0.35s ease,
      box-shadow 0.35s ease;
  }

  .card-chassis::before {
    content: '';
    position: absolute;
    inset: 0.85rem;
    border-radius: 1.45rem;
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 8%, transparent);
    pointer-events: none;
  }

  .card-chassis::after {
    content: '';
    position: absolute;
    inset: auto 1.1rem 1rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--youtube-brand) 32%, transparent), transparent);
    opacity: 0.72;
    pointer-events: none;
  }

  .youtube-card:hover .card-chassis {
    transform: translateY(-0.4rem);
    border-color: var(--youtube-border-strong);
    box-shadow:
      0 1.75rem 3.4rem rgba(0, 0, 0, 0.2),
      0 0 1.4rem color-mix(in srgb, var(--youtube-brand) 12%, transparent);
  }

  .media-stack,
  .content {
    min-width: 0;
  }

  .media-stack {
    display: grid;
    gap: 0.8rem;
    align-content: start;
  }

  .frame-topline,
  .meta-strip,
  .detail-label,
  .watch-link {
    font-family: 'Redwing', Aileron, sans-serif;
  }

  .frame-topline,
  .meta-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
  }

  .platform-badge,
  .status-badge,
  .channel-pill,
  .signal-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.78rem;
    border-radius: 999px;
    font-family: 'Redwing', Aileron, sans-serif;
    font-size: 0.72rem;
    line-height: 1;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .platform-badge {
    background: #ff0000;
    color: #fff;
    box-shadow: 0 0 1rem rgba(255, 0, 0, 0.24);
  }

  .status-badge,
  .channel-pill,
  .signal-pill {
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 22%, transparent);
    background: color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    color: inherit;
  }

  .status-badge.live {
    border-color: color-mix(in srgb, #ff4e4e 30%, transparent);
    background: color-mix(in srgb, #ff4e4e 12%, transparent);
    color: #ffb7b7;
  }

  .status-badge.upcoming {
    border-color: color-mix(in srgb, #ff8c00 30%, transparent);
    background: color-mix(in srgb, #ff8c00 12%, transparent);
    color: #ffd7b7;
  }

  .status-badge.finished {
    border-color: color-mix(in srgb, var(--youtube-accent) 26%, transparent);
    background: color-mix(in srgb, var(--youtube-brand) 8%, transparent);
    color: color-mix(in srgb, var(--youtube-brand) 72%, white 28%);
  }

  .channel-pill {
    background: color-mix(in srgb, var(--youtube-accent) 12%, transparent);
  }

  .signal-pill {
    background: color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    border-color: color-mix(in srgb, var(--youtube-brand) 22%, transparent);
    opacity: 0.88;
  }

  .media-frame {
    position: relative;
    width: 100%;
    aspect-ratio: var(--media-width) / var(--media-height);
    border-radius: 1.45rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
    background: #050608;
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 4%, transparent),
      0 1rem 2rem rgba(0, 0, 0, 0.22);
    /* Simplified clipping: remove clip-path and use clean overflow: hidden */
    overflow: hidden;
    isolation: isolate;
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
    background: #050608;
  }

  .player-frame {
    position: absolute;
    inset: -1px; /* Slight bleed to avoid sub-pixel edge gaps */
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 0;
    background: #050608;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
    min-width: 0; /* Crucial for internal truncation */
    overflow: hidden;
  }

  h3 {
    margin: 0;
    font-family: 'Redwing', Aileron, sans-serif;
    /* Formula adjusted for wide fonts and card padding: 
       Scale by container width, divide by length with safety offset */
    font-size: clamp(1rem, calc(140cqw / (var(--title-len) + 6)), 2rem);
    line-height: 1.16;
    font-weight: 700;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    max-width: 100%;
  }

  .big-card h3 {
    font-size: clamp(1.25rem, calc(160cqw / (var(--title-len) + 8)), 2.35rem);
  }

  .summary {
    margin: 0;
    font-family: Aileron, sans-serif;
    /* Also scale summary slightly if it's very long */
    font-size: clamp(0.85rem, calc(350cqw / (var(--summary-len) + 100)), 1.05rem);
    line-height: 1.68;
    opacity: 0.9;
    white-space: pre-line;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: auto;
  }

  .detail-card {
    display: grid;
    gap: 0.38rem;
    padding: 0.9rem 1rem;
    border-radius: 1.1rem;
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 14%, transparent);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--youtube-brand) 7%, transparent), transparent 60%),
      color-mix(in srgb, var(--youtube-surface-elevated) 94%, transparent);
    min-width: 0;
  }

  .detail-label {
    font-size: 0.68rem;
    line-height: 1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.72;
  }

  .detail-card strong {
    font-family: Aileron, sans-serif;
    font-size: 0.97rem;
    line-height: 1.45;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-top: 0.1rem;
  }

  .watch-link {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    color: color-mix(in srgb, var(--youtube-brand) 82%, currentColor 18%);
    text-decoration: none;
    font-size: 0.82rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: color 0.25s ease, transform 0.25s ease;
  }

  .watch-link svg {
    width: 1rem;
    height: 1rem;
    transition: transform 0.25s ease;
  }

  .watch-link:hover {
    transform: translateX(0.12rem);
  }

  .watch-link:hover svg {
    transform: translateX(0.18rem);
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
      border-radius: 1.65rem;
    }

    .media-frame {
      border-radius: 1.2rem;
    }

    .media-clip {
      clip-path: inset(0 round 1.1rem);
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .card-chassis {
      padding: 1rem;
    }

    h3 {
      font-size: clamp(1.25rem, 6.8vw, 1.7rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card-chassis,
    .watch-link,
    .watch-link svg {
      transition: none;
    }
  }

  :global([data-theme="cyber-neotic"]) .card-chassis {
    box-shadow:
      0 1.5rem 3.2rem rgba(0, 0, 0, 0.2),
      0 0 1.6rem color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
  }

  :global([data-theme="cyber-neotic"]) .media-frame {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 8%, transparent),
      0 1rem 2rem rgba(0, 0, 0, 0.25),
      0 0 1.2rem color-mix(in srgb, var(--youtube-brand) 14%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .detail-card,
  :global([data-theme="cyber-neotic"]) .status-badge,
  :global([data-theme="cyber-neotic"]) .channel-pill,
  :global([data-theme="cyber-neotic"]) .signal-pill {
    box-shadow: inset 0 0 0.9rem color-mix(in srgb, var(--youtube-brand) 4%, transparent);
  }
</style>
