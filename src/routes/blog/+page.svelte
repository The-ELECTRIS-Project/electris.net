<script lang="ts">
  import { onMount } from 'svelte';
  import { t, currentLocale } from '$lib/stores/i18n';
  import { loadBlogPosts, filterPosts, getAllTags, formatDate } from '$lib/utils/blog';
  import type { BlogPost } from '$lib/types/blog';

  $: isPageArabic = $currentLocale === 'ar';

  let posts: BlogPost[] = [];
  let filteredPosts: BlogPost[] = [];
  let searchQuery = '';
  let selectedTag = '';
  let allTags: string[] = [];
  let loading = true;

  onMount(() => {
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };
    setTimeout(cursorReset, 10);

    (async () => {
      try {
        posts = await loadBlogPosts();
        allTags = getAllTags(posts);
        filteredPosts = posts;
        loading = false;
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        loading = false;
      }
    })();

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

  $: {
    filteredPosts = filterPosts(posts, searchQuery, selectedTag);
  }

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
      <span class="title-main">{$t('blog.title', 'Blog')}</span>
      <span class="title-subtitle">{$t('blog.slogan', 'Thoughts and Ideas from the ELECTRIS Project')}</span>
    </h1>
  </div>

  <div class="controls-section">
    <div class="search-wrapper">
      <input
        bind:value={searchQuery}
        type="text"
        placeholder={$t('blog.search.placeholder', 'Search through thoughts...')}
        class="search-input"
      />
    </div>

    <div class="filter-controls">
      <select 
        bind:value={selectedTag}
        class="tag-filter"
      >
        <option value="">{$t('blog.tags.all', 'All Tags')}</option>
        {#each allTags as tag}
          <option value={tag}>{tag}</option>
        {/each}
      </select>

      {#if searchQuery || selectedTag}
        <button 
          on:click={clearFilters}
          class="clear-filters"
        >
          {$t('blog.tags.clear', 'Clear Tags')}
        </button>
      {/if}
    </div>
  </div>

  <div class="posts-section">
    {#if loading}
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>{$t('blog.loading', 'Loading thoughts...')}</p>
      </div>
    {:else if filteredPosts.length === 0}
      <div class="no-posts">
        <h3>{$t('blog.results.none', 'No thoughts found')}</h3>
        <p>{$t('blog.results.tryagain', 'Try adjusting your search query or tags.')}</p>
      </div>
    {:else}
      <div class="posts-grid">
        {#each filteredPosts as post}
          <article class="post-card" class:has-cover={post.coverImage}>
            <a href="/blog/thoughts/{post.slug}" class="post-link">
              {#if post.coverImage}
                <div class="post-background" style="background-image: url({post.coverImage});"></div>
              {/if}
        
              <div class="post-content">
                <div class="post-meta">
                  <time class="post-date">{formatDate(post.date)}</time>
                  {#if post.readTime}
                    <span class="read-time">{post.readTime} {$t('blog.readtime', 'minute read')}</span>
                  {/if}
                  {#if post.featured}
                    <span class="featured-badge">{$t('blog.feature', 'Featured')}</span>
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
    align-items: center;
    position: relative;
    z-index: 2;
    left: 4vmin;
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
    font-family: 'Letric';
    font-size: 1.8rem;
    margin: 0 0 0.8vmin;
    line-height: 1.5;
    font-weight: 600;
    flex: 1;
  }

  .post-description {
    font-family: 'Redwing';
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
</style>