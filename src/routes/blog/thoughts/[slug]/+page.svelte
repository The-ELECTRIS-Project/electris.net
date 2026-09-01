<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { formatDate, resolveBlogLinks, resolveCover, resolveInfoCardStyle, resolvePostTypographyStyle } from '$lib/utils/blog';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import { i18nState, t, availableLocales } from '$lib/state/i18n.svelte';
  import { themeState } from '$lib/state/theme.svelte';
  import { toast } from '$lib/state/toast.svelte';
  import { page } from '$app/state';
  import GithubPreview from '$lib/components/ui/GithubPreview.svelte';
  import InfoIcon from '$lib/components/ui/icons/Info.svelte';
  import type { BlogVersion } from '$lib/types/blog';

  let { data } = $props();

  let isFallback = $derived(
    data.locale && 
    i18nState.currentLocale.replace('-', '_') !== data.locale
  );
  let currentLocaleName = $derived(i18nState.currentLocaleInfo?.name || 'requested language');
  let availablePostLocales = $derived(
    (data.locales as string[] || []).map(code => {
      const normalizedCode = code.replace('_', '-');
      const info = availableLocales.find(l => l.code === normalizedCode);
      return {
        code,
        flag: info?.flag || '🌐'
      };
    })
  );

  let resolvedLinks = $derived(data.post ? resolveBlogLinks(data.post) : []);
  let youtubeLinks = $derived(resolvedLinks.filter((link) => Boolean(link.youtubeEmbedUrl)));
  let spotifyLinks = $derived(resolvedLinks.filter((link) => Boolean(link.spotifyEmbedUrl)));
  let labeledLinks = $derived(resolvedLinks.filter((link) => Boolean(link.label)));
  let youtubeEmbedUrl = $derived(youtubeLinks[0]?.youtubeEmbedUrl);
  let youtubeEmbedAspectRatio = $derived(youtubeLinks[0]?.youtubeEmbedAspectRatio ?? '16 / 9');
  let postInfoStyle = $derived(data.post ? resolveInfoCardStyle(data.post.infoCardStyle) : undefined);
  let postTypographyStyle = $derived(data.post ? resolvePostTypographyStyle(data.post) : undefined);
  let postInfoInlineStyle = $derived([postInfoStyle, postTypographyStyle].filter(Boolean).join('; ') || undefined);

  // Newest first. A version's motif says why it replaced the one below it, so it belongs to the
  // gap between the two, not to either one on its own.
  let versions = $derived((data.versions ?? []) as BlogVersion[]);
  let hasHistory = $derived(versions.length > 1);
  let viewingIndex = $derived(versions.findIndex((version) => version.id === data.currentRevision));
  let replacedBy = $derived(viewingIndex > 0 ? versions[viewingIndex - 1] : undefined);

  function versionHref(version: BlogVersion) {
    const url = new URL(page.url);
    if (version.isCurrent) {
      url.searchParams.delete('v');
    } else if (version.id) {
      url.searchParams.set('v', version.id);
    }
    return `${url.pathname}${url.search}`;
  }

  let fromParam = $derived(page.url.searchParams.get('from'));
  let from = $derived(fromParam && fromParam.length ? fromParam : 'blogs');
  let backHref = $derived(from === 'home' ? '/' : '/blog');
  let backText = $derived(
    from === 'home'
      ? t('blog.return.home', 'Back to Home')
      : from === 'share'
        ? t('blog.return.share', 'Go to Thoughts')
        : t('blog.return.hub', 'Back to Thoughts')
  );
  const buildShareUrl = (currentUrl: URL) => {
    const url = new URL(currentUrl);
    url.searchParams.set('from', 'share');
    return url.toString();
  };
  let shareUrl = $derived(buildShareUrl(page.url));

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data.post?.title ?? 'ELECTRIS Thought',
          url: shareUrl
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.show(t('blog.share.toast', 'Link copied to clipboard'), {
          icon: '/icons/buttons/share.svg'
        });
        return;
      }
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') {
        return;
      }
    }

    window.prompt('Copy this link to share:', shareUrl);
  }

  useHoverConfig([
    {
      type: ['a'],
      selectors: ['.back-link'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: false,
        sentences: true,
        ignoreCharacters: false,
        ignorePunctuation: false
      }
    },
    {
      selectors: ['.share-button'],
      className: 'hovered-blog-share',
      lockPosition: true
    },
    {
      type: ['a'],
      selectors: ['.post-link-out'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: false,
        sentences: true,
        ignoreCharacters: false,
        ignorePunctuation: false
      }
    },
    {
      selectors: ['.cover-embed'],
      className: 'hovered-blog-media-youtube',
      color: 'hsl(0, 100%, 50%)',
      lockPosition: true,
      dynamicSizeOffset: 0.5
    },
    {
      selectors: ['.spotify-embed-wrap'],
      className: 'hovered-blog-media-spotify',
      color: 'hsl(141, 76%, 48%)',
      lockPosition: true,
      trackingTarget: '.spotify-embed',
      positionOffset: { y: -0.2 }
    }
  ]);

  onMount(() => {
    const orbitReset = () => {
      const orbit = document.querySelector('.circle');
      if (orbit) {
        orbit.className = "circle";
      }
    };

    setTimeout(orbitReset, 10);
  });
</script>

<svelte:head>
  {#if data.post}
    <title>{data.post.title} | ELECTRIS</title>
    <meta name="description" content={data.post.description} />
    <meta name="author" content={data.post.author} />
  {:else}
    <title>{t('blog.notfound.title', 'Thought not found')} | ELECTRIS</title>
  {/if}
</svelte:head>

<div class="post-container">
  <div class="post-nav">
    <a 
      href={backHref} 
      class="back-link"
    >
      ← {backText}
    </a>
  </div>

  {#if !data.post}
    <div class="error">
      <h2>{t('blog.notfound.title', 'Thought not found')}</h2>
      <p>{t('blog.notfound.body', 'There is nothing written at this address.')}</p>
      <a href={backHref} class="back-link">← {backText}</a>
    </div>
  {:else}
    {@const currentCover = resolveCover(data.post, themeState.resolvedColorScheme)}
    <article class="post">
      <div class="post-info" style={postInfoInlineStyle}>
        <div class="post-meta">
          <time class="post-date">{formatDate(data.post.date)}</time>
          <span class="author">{t('blog.author.by', 'by')} {data.post.author}</span>
          {#if data.post.readTime}
            <span class="read-time">{data.post.readTime} {t('blog.readtime', 'minute read')}</span>
          {/if}
          {#if data.post.featured}
            <span class="featured-badge">{t('blog.feature', 'Featured')}</span>
          {/if}
          {#if availablePostLocales.length > 1}
            <div
              class="post-available-locales"
              title={t('blog.locales.title', 'Available in more than one language')}
            >
              {#each availablePostLocales as loc}
                <span 
                  class="locale-flag" 
                  class:active={data.locale === loc.code}
                >
                  {loc.flag}
                </span>
              {/each}
            </div>
          {/if}
        </div>

        {#if hasHistory}
          <details class="version-history">
            <summary>
              {t('blog.version.updated', 'Updated')} {formatDate(versions[0].date)}
              <span class="version-count">
                {versions.length - 1}
                {versions.length === 2
                  ? t('blog.version.earlier.one', 'earlier version')
                  : t('blog.version.earlier.many', 'earlier versions')}
              </span>
            </summary>

            <ol class="version-list">
              {#each versions as version, index (version.id ?? 'current')}
                <li class:active={version.id === data.currentRevision}>
                  <div class="version-row">
                    {#if version.id === data.currentRevision}
                      <span class="version-date">{formatDate(version.date)}</span>
                    {:else}
                      <a class="version-date" href={versionHref(version)}>{formatDate(version.date)}</a>
                    {/if}

                    {#if version.isCurrent}
                      <span class="version-tag">{t('blog.version.current', 'Current')}</span>
                    {:else if index === versions.length - 1}
                      <span class="version-tag">{t('blog.version.original', 'Original')}</span>
                    {/if}
                  </div>

                  {#if version.motif && index < versions.length - 1}
                    <p class="version-motif">{version.motif}</p>
                  {/if}
                </li>
              {/each}
            </ol>
          </details>
        {/if}

        {#if youtubeEmbedUrl}
          <div class="cover-image cover-embed" style="--embed-aspect-ratio: {youtubeEmbedAspectRatio};">
            <iframe
              class="youtube-embed"
              src={youtubeEmbedUrl}
              title="{data.post.title} on YouTube"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        {:else if currentCover}
          <div class="cover-image">
            <img class="banner-image" src={currentCover} alt="{data.post.title} cover" loading="eager" decoding="async" />
          </div>
        {/if}

        {#if data.isHistorical}
          <div class="version-notice">
            <InfoIcon size="0.9rem" />
            <div>
              <p>
                {t('blog.version.viewing', 'This is an older version of this post, from')}
                {formatDate(versions[viewingIndex]?.date ?? data.post.date)}.
                <a href={versionHref(versions[0])}>{t('blog.version.readCurrent', 'Read the current version')}</a>
              </p>
              {#if replacedBy?.motif}
                <p class="version-motif">
                  {t('blog.version.replaced', 'It was replaced because:')} {replacedBy.motif}
                </p>
              {/if}
            </div>
          </div>
        {/if}

        <h1 
          class="post-title"
        >
          {data.post.title}
        </h1>

        <p class="post-description">{data.post.description}</p>

        {#if labeledLinks.length > 0}
          <div class="post-links">
            {#each labeledLinks as link, index (`${link.url}-${index}`)}
              <Button href={link.url} external class="post-link-out">
                {link.label}
              </Button>
            {/each}
          </div>
        {/if}

        {#if spotifyLinks.length > 0}
          {#each spotifyLinks as spotifyLink, index (`${spotifyLink.url}-${index}`)}
            <div class="spotify-embed-wrap">
              <iframe
                class="spotify-embed"
                src={spotifyLink.spotifyEmbedUrl}
                title="{data.post.title} on Spotify {index + 1}"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              ></iframe>
            </div>
          {/each}
        {/if}

        <div class="post-tags-row">
          <div class="post-tags">
            {#each data.post.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>

          <button
            type="button"
            class="share-button"
            onclick={handleShare}
            aria-label="Share this thought"
            title="Share"
          >
            <span class="share-label">{t('blog.share', 'Share')}</span>
            <img src="/icons/buttons/share.svg" class="share-icon" alt="" aria-hidden="true" />
          </button>
        </div>

        {#if isFallback}
          <div class="fallback-notice">
            <InfoIcon size="0.9rem" />
            <span>
              {t('blog.fallback.notice', 'This post is not yet available in')} {currentLocaleName}.
              {t('blog.fallback.showing', 'Showing the original version instead.')}
            </span>
          </div>
        {/if}
      </div>

      <div class="post-content">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html data.content}
      </div>

      <GithubPreview content={data.content} />
    </article>
  {/if}
</div>

<style>

  .post-container {
    min-height: 100vh;
    padding: var(--layout-page-top) var(--space-6) var(--space-8);
    max-width: 59rem;
    margin: 0 auto;
    position: relative;
  }

  .error h2 {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    margin-bottom: var(--space-4);
  }

  .banner-image {
    display: block;
    width: 100%;
    height: auto;
  }

  .cover-image {
    width: 100%;
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: var(--space-7);
  }

  .post-info {
    margin-bottom: var(--space-7);
    padding: var(--space-6);
    background: var(--post-info-bg, color-mix(in srgb, var(--accent) 3%, transparent));
    border-radius: var(--radius-lg);
    border: 1px solid var(--post-info-border, color-mix(in srgb, var(--accent) 10%, transparent));
  }

  .post-nav {
    margin-bottom: var(--space-6);
  }

  .back-link {
    color: color-mix(in srgb, var(--accent) 80%, transparent);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    text-decoration: none;
    font-family: var(--font-body);
    font-size: var(--text-base);
    transition:
      var(--transition-colors),
      transform var(--duration-slow) var(--ease-out);
  }

  .back-link:hover {
    color: var(--accent);
    transform: translateX(-3px);
  }

  .version-history {
    margin-bottom: var(--space-4);
    font-family: var(--font-body);
    font-size: var(--text-sm);
  }

  .version-history summary {
    cursor: pointer;
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    opacity: 0.8;
  }

  .version-history summary::-webkit-details-marker {
    display: none;
  }

  .version-history summary::before {
    content: '▸';
    display: inline-block;
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .version-history[open] summary::before {
    transform: rotate(90deg);
  }

  .version-count {
    padding: 0 var(--space-2);
    border-radius: var(--radius-xs);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: var(--text-2xs);
    text-transform: uppercase;
  }

  .version-list {
    margin: var(--space-3) 0 0;
    padding: 0 0 0 var(--space-4);
    list-style: none;
    border-left: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
  }

  .version-list li {
    padding-bottom: var(--space-3);
  }

  .version-list li:last-child {
    padding-bottom: 0;
  }

  .version-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .version-date {
    color: inherit;
  }

  a.version-date:hover {
    text-decoration: underline;
  }

  .version-list li.active .version-date {
    font-weight: 700;
  }

  .version-tag {
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.65;
  }

  /* Sits in the gap between the two versions the edit connects. */
  .version-motif {
    margin: var(--space-1) 0 0;
    padding-left: var(--space-3);
    border-left: 2px solid color-mix(in srgb, var(--accent) 30%, transparent);
    font-size: var(--text-2xs);
    opacity: 0.85;
  }

  .version-notice {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--status-negative-border);
    background: var(--status-negative-bg);
    font-family: var(--font-body);
    font-size: var(--text-sm);
  }

  .version-notice p {
    margin: 0;
  }

  .version-notice a {
    color: var(--accent);
    text-decoration: underline;
  }

  .version-notice .version-motif {
    margin-top: var(--space-2);
    border-left-color: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .fallback-notice {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: color-mix(in srgb, var(--accent) 4%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 8%, transparent);
    border-radius: var(--radius-sm);
    margin-top: var(--space-4);
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    opacity: 0.7;
    width: fit-content;
  }

  .fallback-notice :global(svg) {
    opacity: 0.8;
  }

  .post-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
    font-size: var(--text-sm);
    color: var(--post-info-meta, inherit);
    opacity: 0.7;
  }

  .post-date, .author, .read-time {
    font-family: var(--post-info-meta-font, var(--font-body));
  }

  .featured-badge {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-xs);
    font-size: var(--text-xs);
    font-weight: 600;
    font-family: var(--post-info-meta-font, var(--font-body));
  }

  .post-available-locales {
    display: flex;
    gap: var(--space-1);
    align-items: center;
    margin-left: var(--space-2);
    padding-left: var(--space-3);
    border-left: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .locale-flag {
    font-size: var(--text-sm);
    opacity: 0.4;
    transition:
      opacity var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
    cursor: default;
  }

  .locale-flag.active {
    opacity: 1;
    transform: scale(1.1);
  }

  .post-title {
    font-family: var(--post-title-font, var(--font-display));
    font-size: var(--display-sm);
    line-height: 1.2;
    margin: 0 0 var(--space-5);
    cursor: default;
    color: var(--post-info-title, var(--accent));
    text-shadow: 0 0 0.95rem color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .post-description {
    font-family: var(--post-description-font, var(--font-body));
    font-size: var(--text-md);
    line-height: 1.6;
    margin: 0 0 var(--space-6);
    color: var(--post-info-description, inherit);
    opacity: 0.9;
    font-style: italic;
  }

  .post-links :global(.post-link-out) {
    --btn-raise: translateY(-1px);
    --btn-shadow-hover: 0 0.4rem 0.9rem color-mix(in srgb, var(--accent) 16%, transparent);
    margin: 0;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-sm);
    color: color-mix(in srgb, var(--accent) 95%, transparent);
    font-family: var(--post-info-link-font, var(--font-body));
    font-size: var(--text-sm);
  }

  .post-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0 0 var(--space-5);
  }

  .post-links :global(.post-link-out):focus-visible {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow: 0 0.4rem 0.9rem color-mix(in srgb, var(--accent) 16%, transparent);
  }

  .cover-embed {
    background: var(--scrim-page);
    aspect-ratio: var(--embed-aspect-ratio, 16 / 9);
  }

  .youtube-embed {
    width: 100%;
    height: 100%;
    border: 0;
  }

  .spotify-embed-wrap {
    width: 100%;
    margin-bottom: var(--space-6);
  }

  .spotify-embed {
    width: 100%;
    min-height: 9.5rem;
    border: 0;
    border-radius: var(--radius-lg);
    display: block;
    background: var(--scrim-page);
  }

  .post-tags-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
    margin-bottom: var(--space-6);
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0;
  }

  .tag {
    background: var(--post-info-tag-bg, color-mix(in srgb, var(--accent) 15%, transparent));
    border: 1px solid var(--post-info-tag-border, color-mix(in srgb, var(--accent) 30%, transparent));
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-family: var(--post-info-tag-font, var(--font-body));
    color: var(--post-info-tag-text, inherit);
  }

  .share-button {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-1);
    height: 2.4rem;
    width: 2.6rem;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    color: color-mix(in srgb, var(--accent) 95%, transparent);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    cursor: pointer;
    transition:
      var(--transition-colors),
      width var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
    overflow: hidden;
  }

  .share-button:hover,
  .share-button:focus-visible {
    width: 4.8rem;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    box-shadow: 0 0.45rem 1rem color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .share-icon {
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
  }

  .share-label {
    white-space: nowrap;
    max-width: 0;
    overflow: hidden;
    display: inline-block;
    opacity: 0;
    transform: translateX(0.35rem);
    transition:
      max-width var(--duration-normal) var(--ease-out),
      opacity var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
  }

  .share-button:hover .share-label,
  .share-button:focus-visible .share-label {
    max-width: 6rem;
    opacity: 1;
    transform: translateX(0);
  }

  .post-content {
    font-family: var(--font-body);
    font-size: var(--text-md);
    line-height: 1.8;
    margin-bottom: var(--space-8);
  }

  /* Blog content styling */
  .post-content :global(h1) {
    font-size: var(--text-3xl);
    margin: var(--space-7) 0 var(--space-5);
    color: var(--accent);
  }

  .post-content :global(h2) {
    font-size: var(--text-2xl);
    margin: var(--space-6) 0 var(--space-4);
    color: var(--accent);
  }

  .post-content :global(h3) {
    font-size: var(--text-xl);
    margin: var(--space-6) 0 var(--space-4);
  }

  .post-content :global(p) {
    margin: var(--space-5) 0;
  }

  .post-content :global(blockquote) {
    border-left: 0.3rem solid color-mix(in srgb, var(--accent) 50%, transparent);
    margin: var(--space-6) 0;
    font-style: italic;
    opacity: 0.9;
    background: color-mix(in srgb, var(--accent) 5%, transparent);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    padding: var(--space-4) var(--space-5);
  }

  .post-content :global(code) {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-xs);
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }

  .post-content :global(pre) {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    padding: var(--space-5);
    border-radius: var(--radius-sm);
    overflow-x: auto;
    margin: var(--space-6) 0;
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .post-content :global(pre code) {
    background: none;
    padding: 0;
  }

  .post-content :global(ul ol) {
    padding-left: var(--space-6);
    margin: var(--space-5) 0;
  }

  .post-content :global(li) {
    margin: var(--space-2) 0;
  }

  .post-content :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-sm);
    margin: var(--space-6) 0;
    box-shadow: 0 0.25rem 1.25rem color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .post-content :global(a) {
    color: color-mix(in srgb, var(--accent) 90%, transparent);
    text-decoration: underline;
    transition: var(--transition-colors);
  }

  .post-content :global(a:hover) {
    color: var(--accent);
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .post-container {
      padding: calc(var(--layout-page-top) + var(--space-4)) var(--space-4) var(--space-8);
      max-width: min(48rem, 100%);
    }

    .post-info {
      padding: var(--space-4);
    }

    .post-meta {
      flex-direction: row;
      align-items: center;
      gap: var(--space-2) 0.85rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      min-height: var(--touch-target-size);
    }

    .cover-image { margin-bottom: var(--space-6); }

    .post-title {
      font-size: clamp(2.2rem, 10vw, 3rem);
    }

    .post-description {
      font-size: var(--text-base);
    }

    .post-tags-row {
      gap: var(--space-3);
    }

    .share-button {
      width: auto;
      padding: var(--space-1) var(--space-3);
    }

    .share-button:hover,
    .share-button:focus-visible {
      width: auto;
    }

    .share-label {
      max-width: 6rem;
      opacity: 1;
      transform: none;
    }

    .post-content {
      font-size: var(--text-base);
      line-height: 1.75;
    }

    .post-content :global(h1) {
      font-size: var(--text-2xl);
    }

    .post-content :global(h2) {
      font-size: var(--text-xl);
    }

    .post-content :global(h3) {
      font-size: var(--text-lg);
    }

    .post-content :global(blockquote) {
      padding: var(--space-4);
    }
  }

  @media (max-width: 640px) {
    .post-meta {
      gap: var(--space-1) var(--space-3);
    }

    .post-tags {
      gap: var(--space-2);
    }

    .tag {
      font-size: var(--text-xs);
    }

    .share-button {
      height: 2.1rem;
      font-size: var(--text-sm);
    }

    .share-icon {
      width: 1rem;
      height: 1rem;
    }
  }
</style>
