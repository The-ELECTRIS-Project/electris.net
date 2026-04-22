<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { formatDate, resolveBlogLinks, resolveCover, resolveInfoCardStyle, resolvePostTypographyStyle } from '$lib/utils/blog';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';
  import { t } from '$lib/stores/i18n.svelte';
  import { themeState } from '$lib/stores/theme.svelte';
  import { page } from '$app/state';

  let { data } = $props();

  let relatedPosts = $derived(data.relatedPosts || []);
  let resolvedLinks = $derived(data.post ? resolveBlogLinks(data.post) : []);
  let youtubeLinks = $derived(resolvedLinks.filter((link) => Boolean(link.youtubeEmbedUrl)));
  let spotifyLinks = $derived(resolvedLinks.filter((link) => Boolean(link.spotifyEmbedUrl)));
  let labeledLinks = $derived(resolvedLinks.filter((link) => Boolean(link.label)));
  let youtubeEmbedUrl = $derived(youtubeLinks[0]?.youtubeEmbedUrl);
  let youtubeEmbedAspectRatio = $derived(youtubeLinks[0]?.youtubeEmbedAspectRatio ?? '16 / 9');
  let postInfoStyle = $derived(data.post ? resolveInfoCardStyle(data.post.infoCardStyle) : undefined);
  let postTypographyStyle = $derived(data.post ? resolvePostTypographyStyle(data.post) : undefined);
  let postInfoInlineStyle = $derived([postInfoStyle, postTypographyStyle].filter(Boolean).join('; ') || undefined);

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
  let showCopyToast = $state(false);
  let toastCycle = $state(0);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const triggerCopyToast = () => {
    toastCycle += 1;
    showCopyToast = true;
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      showCopyToast = false;
      toastTimer = null;
    }, 1500);
  };

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
        triggerCopyToast();
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
      lockPosition: true
    },
    {
      selectors: ['.spotify-embed-wrap'],
      className: 'hovered-blog-media-spotify',
      color: 'hsl(141, 76%, 48%)',
      lockPosition: true
    }
  ]);

  onMount(() => {
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };
    setTimeout(cursorReset, 10);

    const createThoughtParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'thought-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (10 + Math.random() * 5) + 's';
      particle.style.animationDelay = Math.random() * 3 + 's';
      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 15000);
    };

    const particleInterval = setInterval(createThoughtParticle, 8000 + Math.random() * 4000);

    return () => {
      clearInterval(particleInterval);
    };
  });

  onDestroy(() => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
  });
</script>

<svelte:head>
  {#if data.post}
    <title>{data.post.title} | ELECTRIS</title>
    <meta name="description" content={data.post.description} />
    <meta name="author" content={data.post.author} />
  {:else}
    <title>Thought Not Found | ELECTRIS</title>
  {/if}
</svelte:head>


{#if showCopyToast}
  {#key toastCycle}
    <div class="copy-toast" role="status" aria-live="polite">
      {t('blog.share.toast', 'Link copied to clipboard')}
    </div>
  {/key}
{/if}

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
      <h2>Thought Not Found</h2>
      <p>The requested post could not be found.</p>
      <a href={backHref} class="back-link">← {backText}</a>
    </div>
  {:else}
    {@const currentCover = resolveCover(data.post, themeState.resolvedColorScheme)}
    <article class="post">
      <div class="post-info" style={postInfoInlineStyle}>
        <div class="post-meta">
          <time class="post-date">{formatDate(data.post.date)}</time>
          <span class="author">by {data.post.author}</span>
          {#if data.post.readTime}
            <span class="read-time">{data.post.readTime} min read</span>
          {/if}
          {#if data.post.featured}
            <span class="featured-badge">Featured</span>
          {/if}
        </div>

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

        <h1 
          class="post-title"
        >
          {data.post.title}
        </h1>

        <p class="post-description">{data.post.description}</p>

        {#if labeledLinks.length > 0}
          <div class="post-links">
            {#each labeledLinks as link, index (`${link.url}-${index}`)}
              <a
                href={link.url}
                class="post-link-out"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
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
      </div>

      <div class="post-content">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html data.content}
      </div>

      {#if relatedPosts.length > 0}
        <aside class="related-posts">
          <h3>Related Thoughts</h3>
          <div class="related-grid">
            {#each relatedPosts as related}
              {@const relatedTypographyStyle = resolvePostTypographyStyle(related)}
              <a href="/blog/thoughts/{related.slug}?from=blogs" class="related-card" style={relatedTypographyStyle}>
                {#if related.icon}
                  <div class="related-icon">
                    <img src={related.icon} alt="{related.title} icon" />
                  </div>
                {/if}
                <div class="related-content">
                  <h4>{related.title}</h4>
                  <p>{related.description}</p>
                  <time>{formatDate(related.date)}</time>
                </div>
              </a>
            {/each}
          </div>
        </aside>
      {/if}
    </article>
  {/if}
</div>

<style>
  @keyframes thought-drift {
    0% {
      opacity: 0;
      transform: translateY(0) translateX(0) scale(1);
    }
    20% {
      opacity: 0.8;
    }
    80% {
      opacity: 0.8;
      transform: translateY(-100vh) translateX(50px) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: translateY(-100vh) translateX(100px) scale(0.8);
    }
  }

  .post-container {
    min-height: 100vh;
    padding: 6rem 2rem 4rem;
    max-width: 80vmin;
    margin: 0 auto;
    position: relative;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes copy-toast-fade {
    0% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    66.666% {
      opacity: 0.65;
      transform: translate(-50%, -0.2rem);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -0.45rem);
    }
  }

  .copy-toast {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 4.5rem);
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 120;
    padding: 0.6rem 1.4rem;
    border-radius: 999px;
    background: rgba(20, 8, 0, 0.75);
    border: 0.1vmin solid rgba(246, 89, 1, 0.45);
    color: rgba(246, 89, 1, 0.95);
    font-family: 'Redwing';
    font-size: 0.95rem;
    letter-spacing: 0.01em;
    box-shadow: 0 0.8rem 1.6rem rgba(0, 0, 0, 0.35), 0 0 1.4rem rgba(246, 89, 1, 0.2);
    backdrop-filter: blur(0.6rem);
    pointer-events: none;
    animation: copy-toast-fade 1.5s ease forwards;
  }

  .error h2 {
    font-family: 'Letric';
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .banner-image {
    display: block;
    width: 100%;
    height: auto;
  }

  .post-nav {
    margin-bottom: 2rem;
  }

  .back-link {
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .back-link:hover {
    color: rgba(255, 255, 255, 1);
  }
  
  .cover-image {
    width: 100%;
    border-radius: 1rem;
    overflow: hidden;
    margin-bottom: 3rem;
  }

  .post-info {
    margin-bottom: 3rem;
    padding: 2rem;
    background: var(--post-info-bg, rgba(246, 89, 1, 0.03));
    border-radius: 1rem;
    border: 0.1vmin solid var(--post-info-border, rgba(246, 89, 1, 0.1));
  }

  .post-nav {
    margin-bottom: 2rem;
  }

  .back-link {
    color: rgba(246, 89, 1, 0.8);
    text-decoration: none;
    font-family: 'Redwing';
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .back-link:hover {
    color: rgba(246, 89, 1, 1);
    transform: translateX(-3px);
  }

  .post-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: var(--post-info-meta, inherit);
    opacity: 0.7;
  }

  .post-date, .author, .read-time {
    font-family: var(--post-info-meta-font, 'Redwing');
  }

  .featured-badge {
    background: rgba(246, 89, 1, 0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    font-family: var(--post-info-meta-font, 'Redwing');
  }

  .post-title {
    font-family: var(--post-title-font, 'Letric');
    font-size: 3rem;
    line-height: 1.2;
    margin: 0 0 1.5rem;
    cursor: default;
    color: var(--post-info-title, var(--accent-color, #ff6811));
    text-shadow: 0 0 15px rgba(246, 89, 1, 0.2);
  }

  .post-description {
    font-family: var(--post-description-font, 'Redwing');
    font-size: 1.2rem;
    line-height: 1.6;
    margin: 0 0 2rem;
    color: var(--post-info-description, inherit);
    opacity: 0.9;
    font-style: italic;
  }

  .post-link-out {
    display: inline-flex;
    align-items: center;
    margin: 0;
    padding: 0.55rem 1rem;
    border-radius: 0.65rem;
    border: 0.1vmin solid rgba(246, 89, 1, 0.35);
    background: rgba(246, 89, 1, 0.12);
    color: rgba(246, 89, 1, 0.95);
    text-decoration: none;
    font-family: var(--post-info-link-font, 'Redwing');
    font-size: 0.95rem;
    transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }

  .post-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin: 0 0 1.5rem;
  }

  .post-link-out:hover,
  .post-link-out:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(246, 89, 1, 0.55);
    background: rgba(246, 89, 1, 0.2);
    box-shadow: 0 0.4rem 0.9rem rgba(246, 89, 1, 0.16);
  }

  .cover-embed {
    background: rgba(0, 0, 0, 0.2);
    aspect-ratio: var(--embed-aspect-ratio, 16 / 9);
  }

  .youtube-embed {
    width: 100%;
    height: 100%;
    border: 0;
  }

  .spotify-embed-wrap {
    width: 100%;
    margin-bottom: 2rem;
  }

  .spotify-embed {
    width: 100%;
    min-height: 9.5rem;
    border: 0;
    border-radius: 0.95rem;
    display: block;
    background: rgba(0, 0, 0, 0.25);
  }

  .post-tags-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin: 0;
  }

  .tag {
    background: var(--post-info-tag-bg, rgba(246, 89, 1, 0.15));
    border: 0.1vmin solid var(--post-info-tag-border, rgba(246, 89, 1, 0.3));
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    font-family: var(--post-info-tag-font, 'Redwing');
    color: var(--post-info-tag-text, inherit);
  }

  .share-button {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.2vmin;
    height: 3.25vmin;
    width: 3.5vmin;
    padding: 0.35vmin 0.86vmin;
    border-radius: 5vmin;
    background: rgba(246, 89, 1, 0.12);
    border: 0.1vmin solid rgba(246, 89, 1, 0.35);
    color: rgba(246, 89, 1, 0.95);
    font-family: 'Redwing';
    font-size: 0.9rem;
    cursor: pointer;
    transition: width 0.25s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    overflow: hidden;
  }

  .share-button:hover,
  .share-button:focus-visible {
    width: 6.5vmin;
    background: rgba(246, 89, 1, 0.18);
    border-color: rgba(246, 89, 1, 0.55);
    box-shadow: 0 0.45rem 1rem rgba(246, 89, 1, 0.15);
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
    transition: max-width 0.25s ease, opacity 0.2s ease, transform 0.2s ease;
  }

  .share-button:hover .share-label,
  .share-button:focus-visible .share-label {
    max-width: 6rem;
    opacity: 1;
    transform: translateX(0);
  }

  .post-content {
    font-family: 'Redwing';
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 4rem;
  }

  /* Blog content styling */
  .post-content :global(h1) {
    font-size: 2.5rem;
    margin: 3rem 0 1.5rem;
    color: var(--accent-color, #ff6811);
  }

  .post-content :global(h2) {
    font-size: 2rem;
    margin: 2.5rem 0 1rem;
    color: var(--accent-color, #ff6811);
  }

  .post-content :global(h3) {
    font-size: 1.5rem;
    margin: 2rem 0 1rem;
  }

  .post-content :global(p) {
    margin: 1.5rem 0;
  }

  .post-content :global(blockquote) {
    border-left: 0.3rem solid rgba(246, 89, 1, 0.5);
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    opacity: 0.9;
    background: rgba(246, 89, 1, 0.05);
    border-radius: 0 0.5rem 0.5rem 0;
    padding: 1rem 1.5rem;
  }

  .post-content :global(code) {
    background: rgba(246, 89, 1, 0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 0.3rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }

  .post-content :global(pre) {
    background: rgba(246, 89, 1, 0.1);
    padding: 1.5rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 2rem 0;
    border: 0.1rem solid rgba(246, 89, 1, 0.2);
  }

  .post-content :global(pre code) {
    background: none;
    padding: 0;
  }

  .post-content :global(ul ol) {
    padding-left: 2rem;
    margin: 1.5rem 0;
  }

  .post-content :global(li) {
    margin: 0.5rem 0;
  }

  .post-content :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 2rem 0;
    box-shadow: 0 4px 20px rgba(246, 89, 1, 0.1);
  }

  .post-content :global(a) {
    color: rgba(246, 89, 1, 0.9);
    text-decoration: underline;
    transition: color 0.3s ease;
  }

  .post-content :global(a:hover) {
    color: rgba(246, 89, 1, 1);
  }

  .related-posts {
    margin-top: 4rem;
    padding-top: 3rem;
    border-top: 0.1rem solid rgba(246, 89, 1, 0.2);
  }

  .related-posts h3 {
    font-family: 'Letric';
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .related-card {
    display: block;
    text-decoration: none;
    color: inherit;
    background: rgba(246, 89, 1, 0.05);
    border: 0.1vmin solid rgba(246, 89, 1, 0.2);
    border-radius: 0.8vmin;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .related-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(246, 89, 1, 0.1);
    border-color: rgba(246, 89, 1, 0.4);
  }

  .related-icon {
    text-align: center;
    margin-bottom: 1rem;
  }

  .related-icon img {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
  }

  .related-content h4 {
    font-family: var(--post-title-font, 'Letric');
    font-size: 1.2rem;
    margin: 0 0 0.5rem;
  }

  .related-content p {
    font-family: var(--post-description-font, 'Redwing');
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0 0 0.8rem;
    line-height: 1.4;
  }

  .related-content time {
    font-size: 0.8rem;
    opacity: 0.6;
    font-family: 'Redwing';
  }

  @media (max-width: 53.33vmin) {
    .post-container {
      padding: 5rem 1rem 4rem;
      max-width: none;
    }

    .post-title {
      font-size: 2.5rem;
    }

    .post-meta {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem 0.85rem;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 62.5vmin), (any-pointer: coarse) {
    .post-container {
      padding: 6.5rem 1rem 4rem;
      max-width: min(48rem, 100%);
    }

    .copy-toast {
      top: calc(env(safe-area-inset-top, 0px) + 4.15rem);
      font-size: 0.9rem;
    }

    .post-info {
      padding: 1.25rem;
    }

    .post-meta {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem 0.85rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      min-height: 2.75rem;
    }

    .cover-image { margin-bottom: 2rem; }

    .post-title {
      font-size: clamp(2.2rem, 10vw, 3rem);
    }

    .post-description {
      font-size: 1.05rem;
    }

    .post-tags-row {
      gap: 0.75rem;
    }

    .share-button {
      width: auto;
      padding: 0.35rem 0.85rem;
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
      font-size: 1rem;
      line-height: 1.75;
    }

    .post-content :global(h1) {
      font-size: 2rem;
    }

    .post-content :global(h2) {
      font-size: 1.7rem;
    }

    .post-content :global(h3) {
      font-size: 1.35rem;
    }

    .post-content :global(blockquote) {
      padding: 1rem;
    }

    .related-posts {
      margin-top: 3rem;
      padding-top: 2rem;
    }

    .related-posts h3 {
      font-size: 1.6rem;
    }

    .related-card {
      padding: 1.1rem;
      border-radius: 1rem;
    }
  }

  @media (max-width: 38.8vmin) {
    .post-meta {
      gap: 0.45rem 0.75rem;
    }

    .post-tags {
      gap: 0.5rem;
    }

    .tag {
      font-size: 0.8rem;
    }

    .share-button {
      height: 2.1rem;
      font-size: 0.85rem;
    }

    .share-icon {
      width: 1rem;
      height: 1rem;
    }

    .copy-toast {
      width: min(90vw, 22rem);
      text-align: center;
      padding: 0.55rem 1rem;
    }
  }
</style>
