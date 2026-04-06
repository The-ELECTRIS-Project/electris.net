<script lang="ts">
  import { onMount } from 'svelte';
  import { formatDate, resolveCover } from '$lib/utils/blog';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';
  import { t } from '$lib/stores/i18n.svelte';
  import { themeState } from '$lib/stores/theme.svelte';
  import { page } from '$app/state';

  let { data } = $props();

  let relatedPosts = $derived(data.relatedPosts || []);

  let from = $derived(page.url.searchParams.get('from'));
  let backHref = $derived(from === 'home' ? '/' : '/blog');
  let backText = $derived(from === 'home' 
    ? t('blog.return.home', 'Back to Home') 
    : t('blog.return.hub', 'Back to Thoughts')
  );

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


<div class="post-container">
  {#if from}
    <div class="post-nav">
      <a 
        href={backHref} 
        class="back-link"
      >
        ← {backText}
      </a>
    </div>
  {/if}

  {#if !data.post}
    <div class="error">
      <h2>Thought Not Found</h2>
      <p>The requested post could not be found.</p>
      {#if from}
        <a href={backHref} class="back-link">← {backText}</a>
      {/if}
    </div>
  {:else}
    {@const currentCover = resolveCover(data.post, themeState.resolvedColorScheme)}
    <article class="post">
      <div class="post-info">
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

        {#if currentCover}
          <div class="cover-image">
            <div class="banner-image" style="background-image: url({currentCover});"></div>
          </div>
        {/if}

        <h1 
          class="post-title"
        >
          {data.post.title}
        </h1>

        <p class="post-description">{data.post.description}</p>

        <div class="post-tags">
          {#each data.post.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      </div>

      <div class="post-content">
        {@html data.content}
      </div>

      {#if relatedPosts.length > 0}
        <aside class="related-posts">
          <h3>Related Thoughts</h3>
          <div class="related-grid">
            {#each relatedPosts as related}
              <a href="/blog/thoughts/{related.slug}?from=blogs" class="related-card">
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

  .error h2 {
    font-family: 'Letric';
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .banner-image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .banner-image::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.5) 60%,
      rgba(0, 0, 0, 0.8) 100%
    );
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
    height: 35vmin;
    position: relative;
    border-radius: 1rem;
    overflow: hidden;
    margin-bottom: 3rem;
  }

  .post-info {
    margin-bottom: 3rem;
    padding: 2rem;
    background: rgba(246, 89, 1, 0.03);
    border-radius: 1rem;
    border: 0.1vmin solid rgba(246, 89, 1, 0.1);
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
    opacity: 0.7;
  }

  .post-date, .author, .read-time {
    font-family: 'Redwing';
  }

  .featured-badge {
    background: rgba(246, 89, 1, 0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .post-title {
    font-family: 'Letric';
    font-size: 3rem;
    line-height: 1.2;
    margin: 0 0 1.5rem;
    cursor: default;
    color: var(--accent-color, #ff6811);
    text-shadow: 0 0 15px rgba(246, 89, 1, 0.2);
  }

  .post-description {
    font-family: 'Redwing';
    font-size: 1.2rem;
    line-height: 1.6;
    margin: 0 0 2rem;
    opacity: 0.9;
    font-style: italic;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 2rem;
  }

  .tag {
    background: rgba(246, 89, 1, 0.15);
    border: 0.1vmin solid rgba(246, 89, 1, 0.3);
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    font-family: 'Redwing';
  }

  .post-content {
    font-family: 'Redwing';
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 4rem;
  }

  /* Blog content styling */
  .post-content :global(h1) {
    font-family: 'Letric';
    font-size: 2.5rem;
    margin: 3rem 0 1.5rem;
    color: var(--accent-color, #ff6811);
  }

  .post-content :global(h2) {
    font-family: 'Letric';
    font-size: 2rem;
    margin: 2.5rem 0 1rem;
    color: var(--accent-color, #ff6811);
  }

  .post-content :global(h3) {
    font-family: 'Letric';
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
    font-family: 'Letric';
    font-size: 1.2rem;
    margin: 0 0 0.5rem;
  }

  .related-content p {
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

  @media (max-width: 768px) {
    .post-container {
      padding: 5rem 1rem 4rem;
      max-width: none;
    }

    .post-title {
      font-size: 2.5rem;
    }

    .cover-image {
      height: 25vmin;
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

  @media (max-width: 900px), (any-pointer: coarse) {
    .post-container {
      padding: 6.5rem 1rem 4rem;
      max-width: min(48rem, 100%);
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

    .cover-image {
      height: min(60vw, 18rem);
      margin-bottom: 2rem;
    }

    .post-title {
      font-size: clamp(2.2rem, 10vw, 3rem);
    }

    .post-description {
      font-size: 1.05rem;
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

  @media (max-width: 560px) {
    .post-meta {
      gap: 0.45rem 0.75rem;
    }

    .post-tags {
      gap: 0.5rem;
    }

    .tag {
      font-size: 0.8rem;
    }
  }
</style>
