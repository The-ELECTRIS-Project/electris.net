<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';
  import { themeState } from '$lib/state/theme.svelte';
  import { filterPosts, getAllTags, formatDate, resolveCover, resolvePostTypographyStyle } from '$lib/utils/blog';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import PageShell from '$lib/components/ui/PageShell.svelte';
  import TagFilter from './components/ui/TagFilter.svelte';

  let { data } = $props();

  let posts = $derived(data.posts || []);
  let searchQuery = $state('');
  let selectedTags = $state<string[]>([]);
  let allTags = $derived(getAllTags(posts));
  let loading = $state(false);
  let filteredPosts = $derived(filterPosts(posts, searchQuery, selectedTags));

  useHoverConfig([
    {
      selectors: ['.post-card'],
      className: 'hovered-blog-card',
      lockPosition: true,
      color: 'var(--accent)'
    },
    {
      selectors: ['.search-wrapper'],
      className: 'hovered-blog-search',
      lockPosition: true,
      trackingTarget: '.search-input'
    },
    {
      selectors: ['.tag-filter-container'],
      className: 'hovered-blog-filter',
      customPositioning: {
        targetSelector: '.filter-trigger'
      },
      lockPosition: true
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

  function clearFilters() {
    searchQuery = '';
    selectedTags = [];
  }
</script>

<svelte:head>
  <title>Blog | ELECTRIS</title>
  <meta name="description" content="Thoughts and Ideas from the ELECTRIS Project" />
</svelte:head>

<PageShell width="wide" class="blog-container">

  <div class="hero-section">
    <h1
      class="blog-title"
    >
      <span class="title-main">{t('blog.title')}</span>
      <span class="title-subtitle">{t('blog.slogan')}</span>
    </h1>
  </div>

  <div class="controls-section">
    <div class="search-wrapper">
      <input
        bind:value={searchQuery}
        type="text"
        placeholder={t('blog.search.placeholder')}
        class="search-input"
      />
    </div>

    <div class="filter-controls">
      <TagFilter tags={allTags} bind:selectedTags={selectedTags} />

      {#if searchQuery}
        <button
          onclick={clearFilters}
          class="clear-filters"
        >
          {t('blog.tags.clear')}
        </button>
      {/if}
    </div>
  </div>

  <div class="posts-section">
    {#if loading}
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>{t('blog.loading')}</p>
      </div>
    {:else if filteredPosts.length === 0}
      <div class="no-posts">
        <h3>{t('blog.results.none', 'No thoughts found')}</h3>
        <p>{t('blog.results.tryagain')}</p>
      </div>
    {:else}
      <div class="posts-grid">
        {#each filteredPosts as post}
          {@const currentCover = resolveCover(post, themeState.resolvedColorScheme)}
          {@const postTypographyStyle = resolvePostTypographyStyle(post)}
          <article class="post-card wrap-no-interact-all" class:has-cover={currentCover} style={postTypographyStyle}>
            <a href="/blog/thoughts/{post.slug}?from=blogs" class="post-link">
              {#if currentCover}
                <div class="post-background" style="background-image: url({currentCover});"></div>
              {/if}

              <div class="post-content">
                <div class="post-meta">
                  <time class="post-date">{formatDate(post.date)}</time>
                  {#if post.readTime}
                    <span class="read-time">{post.readTime} {t('blog.readtime')}</span>
                  {/if}
                  {#if post.featured}
                    <span class="featured-badge">{t('blog.feature')}</span>
                  {/if}
                </div>

                {#if post.icon}
                  <div class="post-icon">
                    <img src={post.icon} alt="{post.title} icon"/>
                  </div>
                {/if}

                <h2 class="post-title">{post.title}</h2>
                <p class="post-description">{post.description}</p>

                <div class="post-tags">
                  {#each post.tags as tag}
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
              </div>
            </a>
          </article>
        {/each}
      </div>
    {/if}
  </div>
</PageShell>

<style>
  :global(.blog-container) {
    position: relative;
  }

    .hero-section {
    text-align: center;
    margin-bottom: var(--space-8);
    position: relative;
    z-index: var(--z-raised);
  }

  .blog-title {
    font-size: var(--display-md);
    font-weight: 700;
    margin: 0;
    cursor: default;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .title-main {
    font-family: var(--font-display);
    color: var(--accent);
    text-shadow: 0 0 1.25rem color-mix(in srgb, var(--accent) 30%, transparent);
    display: block;
  }

  .title-subtitle {
    font-family: var(--font-body);
    font-size: 0.45em;
    font-weight: 300;
    opacity: 0.8;
    display: block;
  }

  .controls-section {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-5);
    justify-content: center;
    align-items: center;
    margin-bottom: var(--space-7);
    position: relative;
    z-index: var(--z-sticky);
  }

  .search-wrapper {
    flex: 1;
    max-width: 20rem;
    min-width: 250px;
  }

  .search-input {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: inherit;
    outline: none;
    transition:
      var(--transition-colors),
      box-shadow var(--duration-normal) var(--ease-out);
  }

  .search-input:focus {
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    box-shadow: 0 0 0.95rem color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .search-input::placeholder {
    color: color-mix(in srgb, var(--accent) 60%, transparent);
  }

  .filter-controls {
    display: flex;
    gap: var(--space-4);
    align-items: center;
  }

  .clear-filters {
    padding: var(--space-3) var(--space-4);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: inherit;
    cursor: pointer;
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out);
  }

  .clear-filters:hover {
    background: color-mix(in srgb, var(--accent) 30%, transparent);
    transform: translateY(-1px);
  }

  .posts-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: var(--z-raised);
  }

  .loading {
    text-align: center;
    padding: var(--space-8) 0;
  }

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 0.3rem solid color-mix(in srgb, var(--accent) 20%, transparent);
    border-top: 0.3rem solid color-mix(in srgb, var(--accent) 80%, transparent);
    border-radius: var(--radius-round);
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-4);
  }

  .no-posts {
    text-align: center;
    padding: var(--space-8) 0;
  }

  .no-posts h3 {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    margin-bottom: var(--space-4);
  }

  .posts-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 72rem;
    width: 100%;
  }

  .post-card {
    background: color-mix(in srgb, var(--accent) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition:
      var(--transition-colors),
      transform var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
    position: relative;
    width: 100%;
    min-height: 12rem;
  }

  .post-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.95rem 2.5rem color-mix(in srgb, var(--accent) 15%, transparent);
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .post-link {
    display: block;
    text-decoration: none;
    color: inherit;
    height: 100%;
    position: relative;
    min-height: 12rem;
  }

  .post-background {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 81%;
    background-size: cover;
    background-position: center right;
    background-repeat: no-repeat;
    z-index: 1;

    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 100%),
                        radial-gradient(ellipse at 100% 50%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 55%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 100%),
                radial-gradient(ellipse at 100% 50%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 55%, transparent 100%);
    -webkit-mask-composite: source-in;
    mask-composite: intersect;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to right,
        transparent 0%,
        color-mix(in srgb, var(--surface-page) 10%, transparent) 40%,
        color-mix(in srgb, var(--surface-page) 40%, transparent) 100%
      );
    }
  }

  .post-content {
    padding: var(--space-5);
    position: relative;
    z-index: var(--z-raised);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .post-card.has-cover .post-content {
    background: linear-gradient(
      to right,
      color-mix(in srgb, var(--accent) 8%, transparent) 0%,
      color-mix(in srgb, var(--accent) 4%, transparent) 50%,
      transparent 100%
    );
  }

  .post-icon {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    width: fit-content;
  }

  .post-icon img {
    width: 3rem;
    height: 3rem;
    object-fit: contain;
    flex-shrink: 0;
  }

  .post-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    font-size: var(--text-sm);
    opacity: 0.9;
    font-weight: 500;
  }

  .post-date {
    font-family: var(--font-body);
  }

  .read-time {
    font-family: var(--font-body);
  }

  .featured-badge {
    background: color-mix(in srgb, var(--accent) 30%, transparent);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-xs);
    font-size: var(--text-2xs);
    font-weight: 600;
    border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
  }

  .post-title {
    font-family: var(--post-title-font, var(--font-display));
    font-size: var(--text-xl);
    margin: 0 0 var(--space-2);
    line-height: 1.5;
    font-weight: 600;
    flex: 1;
  }

  .post-description {
    font-family: var(--post-description-font, var(--font-body));
    font-size: var(--text-base);
    line-height: 1.5;
    margin: 0 0 var(--space-4);
    opacity: 0.95;
    flex-grow: 1;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: auto;
  }

  .tag {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-xs);
    font-size: var(--text-xs);
    font-family: var(--font-body);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .post-background {
      width: 100%;
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 100%),
                          radial-gradient(ellipse at 50% 100%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 55%, transparent 100%);
      mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 100%),
                  radial-gradient(ellipse at 50% 100%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 55%, transparent 100%);
      -webkit-mask-composite: source-in;
      mask-composite: intersect;
    }

    .post-card.has-cover .post-content {
      background: linear-gradient(
        to bottom,
        transparent 0%,
        color-mix(in srgb, var(--accent) 4%, transparent) 40%,
        color-mix(in srgb, var(--accent) 8%, transparent) 100%
      );
    }
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    :global(.blog-container) {
      --shell-pad-top: calc(var(--layout-page-top) + var(--space-4));
      --shell-pad-inline: var(--space-4);
      --shell-max: 48rem;
    }

    .hero-section {
      margin-bottom: var(--space-7);
    }

    .blog-title {
      font-size: clamp(2.6rem, 11vw, 3.6rem);
      gap: var(--space-3);
    }

    .controls-section {
      gap: 0.85rem;
      align-items: stretch;
      justify-content: stretch;
      flex-wrap: nowrap;
    }

    .search-wrapper {
      flex: 1 1 0;
      width: auto;
      min-width: 0;
      max-width: none;
    }

    .filter-controls {
      flex: 0 0 auto;
      width: auto;
      max-width: 45%;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-content: flex-start;
      gap: var(--space-3);
    }

    .search-input,
    .clear-filters {
      min-height: var(--touch-target-size);
      font-size: var(--text-base);
    }

    .clear-filters {
      flex: 0 0 auto;
      min-width: max-content;
    }

    .posts-grid {
      gap: var(--space-4);
    }

    .post-card,
    .post-link {
      min-height: 14rem;
    }

    .post-content {
      padding: var(--space-4);
    }

    .post-title {
      font-size: var(--text-xl);
      line-height: 1.25;
    }

    .post-description {
      font-size: var(--text-base);
    }

    .tag {
      font-size: var(--text-sm);
    }
  }

  @media (max-width: 640px) {
    :global(.blog-container) {
      --shell-pad-top: var(--layout-page-top);
    }

    .controls-section {
      gap: 0.7rem;
    }

    .filter-controls {
      max-width: 50%;
      gap: 0.55rem;
    }

    .post-link {
      min-height: 16rem;
    }

    .post-icon img {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
</style>
