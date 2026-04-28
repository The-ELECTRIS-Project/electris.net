<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n.svelte';
  import { themeState } from '$lib/stores/theme.svelte';
  import { filterPosts, getAllTags, formatDate, resolveCover, resolvePostTypographyStyle } from '$lib/utils/blog';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';

  let { data } = $props();

  let posts = $derived(data.posts || []);
  let searchQuery = $state('');
  let selectedTag = $state('');
  let allTags = $derived(getAllTags(posts));
  let loading = $state(false);
  let filteredPosts = $derived(filterPosts(posts, searchQuery, selectedTag));

  useHoverConfig([
    {
      selectors: ['.post-card'],
      className: 'hovered-blog-card',
      lockPosition: true,
      color: 'var(--accent-color, #ff6811)',
      borderRadius: 1.2
    },
    {
      selectors: ['.search-wrapper'],
      className: 'hovered-blog-search',
      lockPosition: true,
      borderRadius: 0.6
    },
    {
      selectors: ['.tag-filter'],
      className: 'hovered-blog-filter',
      customPositioning: {
        targetSelector: '.tag-filter'
      },
      lockPosition: true,
      borderRadius: 0.6
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

    const createFloatingOrb = () => {
      const orb = document.createElement('div');
      orb.className = 'floating-orb';
      orb.style.left = Math.random() * 100 + '%';
      orb.style.animationDuration = (6 + Math.random() * 4) + 's';
      orb.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(orb);

      setTimeout(() => {
        orb.remove();
      }, 10000);
    };

    const orbInterval = setInterval(createFloatingOrb, 5000 + Math.random() * 3000);

    return () => {
      clearInterval(orbInterval);
    };
  });

  function clearFilters() {
    searchQuery = '';
    selectedTag = '';
  }
</script>

<svelte:head>
  <title>Blog | ELECTRIS</title>
  <meta name="description" content="Thoughts and Ideas from the ELECTRIS Project" />
</svelte:head>

<div class="blog-container">
  <div class="ambient-dots">
    <div class="ambient-dot dot-1"></div>
    <div class="ambient-dot dot-2"></div>
    <div class="ambient-dot dot-3"></div>
    <div class="ambient-dot dot-4"></div>
  </div>

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
      <select 
        bind:value={selectedTag}
        class="tag-filter"
      >
      <option value="">{t('blog.tags.all')}</option>
        {#each allTags as tag}
          <option value={tag}>{tag}</option>
        {/each}
      </select>

      {#if searchQuery || selectedTag}
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
</div>

<style>
  :global(.floating-orb) {
    position: fixed;
    width: 3px;
    height: 3px;
    background: rgba(246, 89, 1, 0.7);
    border-radius: 50%;
    opacity: 0;
    top: 100vh;
    z-index: 1;
    animation: float-up-blog 8s linear forwards;
    pointer-events: none;
    box-shadow: 0 0 6px rgba(246, 89, 1, 0.5);
  }

  @keyframes float-up-blog {
    0% {
      opacity: 0;
      transform: translateY(0) translateX(0) rotate(0deg);
    }
    10% {
      opacity: 0.9;
    }
    90% {
      opacity: 0.9;
      transform: translateY(-100vh) translateX(30px) rotate(180deg);
    }
    100% {
      opacity: 0;
      transform: translateY(-100vh) translateX(60px) rotate(360deg);
    }
  }

  .blog-container {
    min-height: 100vh;
    padding: 6rem 2rem 4rem;
    max-width: 120vh;
    margin: 0 auto;
    position: relative;
  }

  .ambient-dots {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
  }

  .ambient-dot {
    position: absolute;
    width: 0.15vmin;
    height: 0.15vmin;
    background: rgba(246, 89, 1, 0.4);
    border-radius: 50%;
    animation: ambient-pulse-blog 5s ease-in-out infinite;
  }

  .dot-1 {
    top: 15%;
    left: 8%;
    animation-delay: 0s;
  }

  .dot-2 {
    top: 65%;
    right: 12%;
    animation-delay: 2s;
  }

  .dot-3 {
    bottom: 25%;
    left: 75%;
    animation-delay: 4s;
  }

  .dot-4 {
    top: 40%;
    left: 85%;
    animation-delay: 1s;
  }

  @keyframes ambient-pulse-blog {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(2.5); }
  }

  .hero-section {
    text-align: center;
    margin-bottom: 4rem;
    position: relative;
    z-index: 2;
  }

  .blog-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin: 0;
    cursor: default;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .title-main {
    font-family: 'Letric';
    color: var(--accent-color, #ff6811);
    text-shadow: 0 0 20px rgba(246, 89, 1, 0.3);
    display: block;
  }

  .title-subtitle {
    font-family: 'Redwing';
    font-size: 0.45em;
    font-weight: 300;
    opacity: 0.8;
    display: block;
  }

  .controls-section {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
    align-items: center;
    margin-bottom: 3rem;
    position: relative;
    z-index: 10;
  }

  .search-wrapper {
    flex: 1;
    max-width: 28.143vh;
    min-width: 250px;
  }

  .search-input {
    width: 100%;
    padding: 0.8rem 1.2rem;
    background: rgba(246, 89, 1, 0.1);
    border: 0.2vmin solid rgba(246, 89, 1, 0.3);
    border-radius: 0.6vmin;
    font-family: 'Redwing';
    font-size: 1rem;
    color: inherit;
    outline: none;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    border-color: rgba(246, 89, 1, 0.6);
    box-shadow: 0 0 15px rgba(246, 89, 1, 0.2);
  }

  .search-input::placeholder {
    color: rgba(246, 89, 1, 0.6);
  }

  .filter-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .tag-filter {
    padding: 0.8rem 1rem;
    background: rgba(246, 89, 1, 0.1);
    border: 0.2vmin solid rgba(246, 89, 1, 0.3);
    border-radius: 0.6vmin;
    font-family: 'Redwing';
    font-size: 0.9rem;
    color: inherit;
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tag-filter:focus {
    border-color: rgba(246, 89, 1, 0.6);
    box-shadow: 0 0 10px rgba(246, 89, 1, 0.2);
  }

  .clear-filters {
    padding: 0.8rem 1.2rem;
    background: rgba(246, 89, 1, 0.2);
    border: 0.2vmin solid rgba(246, 89, 1, 0.4);
    border-radius: 0.6vmin;
    font-family: 'Redwing';
    font-size: 0.9rem;
    color: inherit;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .clear-filters:hover {
    background: rgba(246, 89, 1, 0.3);
    transform: translateY(-1px);
  }

  .posts-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .loading {
    text-align: center;
    padding: 4rem 0;
  }

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 0.3rem solid rgba(246, 89, 1, 0.2);
    border-top: 0.3rem solid rgba(246, 89, 1, 0.8);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .no-posts {
    text-align: center;
    padding: 4rem 0;
  }

  .no-posts h3 {
    font-family: 'Letric';
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .posts-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 100vh;
    width: 100%;
  }

  .post-card {
    background: rgba(246, 89, 1, 0.05);
    border: 0.1vmin solid rgba(246, 89, 1, 0.2);
    border-radius: 1rem;
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
    width: 100%;
    min-height: 12rem;
  }

  .post-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(246, 89, 1, 0.15);
    border-color: rgba(246, 89, 1, 0.4);
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
    width: 80%;
    background-size: cover;
    background-position: center right;
    background-repeat: no-repeat;
    z-index: 1;
    
    -webkit-mask: linear-gradient(to right, transparent 1%, rgba(0,0,0,0.1) 3%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,1) 80%);
    mask: linear-gradient(to right, transparent 1%, rgba(0,0,0,0.1) 3%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,1) 80%);
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to right,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.1) 30%,
        rgba(0, 0, 0, 0.3) 70%,
        rgba(0, 0, 0, 0.5) 100%
      );
    }
  }

  :global([data-color-scheme='light']) .post-background::after {
    background: linear-gradient(
      to right,
      rgba(255, 245, 236, 0) 0%,
      rgba(255, 245, 236, 0.12) 30%,
      rgba(255, 245, 236, 0.28) 70%,
      rgba(255, 245, 236, 0.48) 100%
    );
  }

  .post-content {
    padding: 1.5rem;
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .post-card.has-cover .post-content {
    background: linear-gradient(
      to right,
      rgba(246, 89, 1, 0.08) 0%,
      rgba(246, 89, 1, 0.04) 50%,
      transparent 100%
    );
  }

  .post-icon {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
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
    gap: 0.8rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    opacity: 0.9;
    font-weight: 500;
  }

  .post-date {
    font-family: 'Redwing';
  }

  .read-time {
    font-family: 'Redwing';
  }

  .featured-badge {
    background: rgba(246, 89, 1, 0.3);
    padding: 0.2rem 0.6rem;
    border-radius: 0.3rem;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid rgba(246, 89, 1, 0.5);
  }

  .post-title {
    font-family: var(--post-title-font, 'Letric');
    font-size: 1.8rem;
    margin: 0 0 0.8vmin;
    line-height: 1.5;
    font-weight: 600;
    flex: 1;
  }

  .post-description {
    font-family: var(--post-description-font, 'Redwing');
    font-size: 1rem;
    line-height: 1.5;
    margin: 0 0 1.2rem;
    opacity: 0.95;
    flex-grow: 1;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: auto;
  }

  .tag {
    background: rgba(246, 89, 1, 0.2);
    border: 0.1vmin solid rgba(246, 89, 1, 0.4);
    padding: 0.3rem 0.6rem;
    border-radius: 0.4rem;
    font-size: 0.8rem;
    font-family: 'Redwing';
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .post-background {
      width: 100%;
      -webkit-mask: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.2) 80%, transparent 100%);
      mask: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.2) 80%, transparent 100%);
    }
    
    .post-card.has-cover .post-content {
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(246, 89, 1, 0.04) 40%,
        rgba(246, 89, 1, 0.08) 100%
      );
    }
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .blog-container {
      padding: 6.5rem 1rem 4rem;
      max-width: 48rem;
    }

    .hero-section {
      margin-bottom: 3rem;
    }

    .blog-title {
      font-size: clamp(2.6rem, 11vw, 3.6rem);
      gap: 0.75rem;
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
      gap: 0.75rem;
    }

    .search-input,
    .tag-filter,
    .clear-filters {
      min-height: 3rem;
      font-size: 1rem;
    }

    .tag-filter {
      width: min(10rem, 32vw);
      min-width: 8rem;
      flex: 0 0 auto;
    }

    .clear-filters {
      flex: 0 0 auto;
      min-width: max-content;
    }

    .posts-grid {
      gap: 1.25rem;
    }

    .post-card,
    .post-link {
      min-height: 14rem;
    }

    .post-content {
      padding: 1.25rem;
    }

    .post-title {
      font-size: 1.6rem;
      line-height: 1.25;
    }

    .post-description {
      font-size: 1rem;
    }

    .tag {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 640px) {
    .blog-container {
      padding-top: 5.75rem;
    }

    .controls-section {
      gap: 0.7rem;
    }

    .filter-controls {
      max-width: 50%;
      gap: 0.55rem;
    }

    .tag-filter {
      width: min(8.75rem, 38vw);
      min-width: 7.4rem;
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
