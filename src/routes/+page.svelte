<script lang="ts">
  import { onMount } from 'svelte';
  import { t, i18nState } from '$lib/state/i18n.svelte';
  import { themeState } from '$lib/state/theme.svelte';
  import { modsState } from '$lib/state/mods.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import { resolveCover, resolvePostTypographyStyle } from '$lib/utils/blog';
  import type { YoutubeData, YoutubeVideo } from '$lib/types/youtube';
  import YouTube from '$lib/components/youtube/Card.svelte';
  import YTLive from '$lib/components/youtube/LiveSection.svelte';
  import YTSkeleton from '$lib/components/youtube/Skeleton.svelte';

  type HomeSection = 'hero' | 'news';

  let { data } = $props();
  
  let includeExcludedVideos = $derived(modsState.config.devTools.ignoreExcludedSuffixes);

  function processYoutubeData(youtube: YoutubeData, includeExcluded: boolean) {
    const videos = youtube.videos.filter((v: YoutubeVideo) => includeExcluded || !v.isExcluded);
    const liveAndUpcoming = videos.filter((v: YoutubeVideo) => v.status === 'live' || v.status === 'upcoming');
    
    const newestPerChannel = (() => {
      const map = new Map<string, YoutubeVideo>();
      videos
        .filter((v: YoutubeVideo) => v.status === 'finished')
        .forEach((v: YoutubeVideo) => {
          if (!map.has(v.channelId)) map.set(v.channelId, v);
        });
      return Array.from(map.values()).sort((a: YoutubeVideo, b: YoutubeVideo) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    })();

    const displayVideos = newestPerChannel.slice(0, 2);

    return { liveAndUpcoming, displayVideos };
  }

  let pointer = $state({ x: 50, y: 22 });
  let scrollShift = $state(0);
  let visibleSections = $state<Record<HomeSection, boolean>>({
    hero: false,
    news: false
  });

  let latestPost = $derived(data.latestPost ?? null);
  let latestPostHref = $derived(latestPost ? `/blog/thoughts/${latestPost.slug}?from=home` : '/blog');
  let latestPostDate = $derived(
    latestPost
      ? new Intl.DateTimeFormat(i18nState.currentLocale || 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(latestPost.date))
      : ''
  );

  let snapshotCards = $derived([
    {
      slug: 'devlog',
      label: t('home.snapshot.devlog.label', 'Not yet'),
      title: t('home.snapshot.devlog.title', 'Latest devlog'),
      body: t(
        'home.snapshot.devlog.body',
        "Once there's progress on the games worth showing, it'll go here."
      )
    },
    {
      slug: 'music',
      label: t('home.snapshot.music.label', 'Not yet'),
      title: t('home.snapshot.music.title', 'Latest music'),
      body: t(
        'home.snapshot.music.body',
        'Music we make, or music we just want to share, will land here.'
      )
    }
  ]);

  useHoverConfig([
    {
      selectors: ['.logo-card'],
      className: 'hovered-home-logo',
      lockPosition: true,
      matchRotation: true,
      color: 'color-mix(in srgb, var(--accent) 78%, var(--brand-electro) 22%)',
      dynamicSizeOffset: 1
    },
    {
      selectors: ['.info-buttons.about-link'],
      className: 'hovered-home-link-about',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--accent) 74%, var(--brand-electris) 26%)'
    },
    {
      selectors: ['.info-buttons.latest-link'],
      className: 'hovered-home-link-latest',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--brand-electro) 62%, var(--accent) 38%)'
    },
    {
      selectors: ['.hero-frame.slogan-frame'],
      className: 'hovered-home-slogan',
      lockPosition: true,
      matchRotation: true,
      color: 'color-mix(in srgb, var(--brand-electro) 58%, var(--accent) 42%)',
      dynamicSizeOffset: {
        width: -0.8,
        height: -1.6
      }
    },
    {
      selectors: ['.news-card.latest-blog'],
      className: 'hovered-home-latest-big',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--accent) 68%, var(--brand-electris) 32%)'
    },
    {
      selectors: ['.news-card.latest-blog-empty'],
      className: 'hovered-home-latest-big',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--accent) 68%, var(--brand-electris) 32%)'
    },
    {
      selectors: ['.show-all-link'],
      className: 'hovered-home-show-all',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--brand-electro) 40%, var(--accent) 60%)'
    },
    {
      selectors: ['.snapshot-mini.devlog'],

      className: 'hovered-home-latest-small',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--brand-electris) 50%, var(--brand-electro) 50%)'
    },
    {
      selectors: ['.snapshot-mini.music'],
      className: 'hovered-home-latest-small',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--brand-electris) 50%, var(--brand-electro) 50%)'
    },
    {
      selectors: ['.manifesto-copy', '.news-intro'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      preventRotation: true,
      wrapText: {
        words: true,
        ignoreCharacters: true,
        ignorePunctuation: true
      }
    }
  ]);

  let pointerFrame = 0;
  let scrollFrame = 0;

  function handlePointerMove(event: MouseEvent) {
    const { clientX, clientY } = event;
    if (pointerFrame) return;

    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      pointer.x = (clientX / window.innerWidth) * 100;
      pointer.y = (clientY / window.innerHeight) * 100;
    });
  }

  function handleScroll() {
    if (scrollFrame) return;

    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      scrollShift = Math.min(window.scrollY, window.innerHeight * 1.4);
    });
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const sectionKey = entry.target.getAttribute('data-section') as HomeSection | null;
          if (!sectionKey) return;

          visibleSections[sectionKey] = true;
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    document.querySelectorAll<HTMLElement>('[data-section]').forEach((section) => {
      observer.observe(section);
    });

    const orbitReset = () => {
      const orbit = document.querySelector('.circle');
      if (orbit) {
        orbit.className = "circle";
      }
    };

    setTimeout(orbitReset, 10);
    handleScroll();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(scrollFrame);
    };
  });
</script>

<svelte:head>
  <title>The ELECTRIS Project</title>
</svelte:head>

<svelte:window onmousemove={handlePointerMove} onscroll={handleScroll} />

<div
  class="landing-page"
  style={`--pointer-x:${pointer.x}%; --pointer-y:${pointer.y}%; --scroll-soft:${scrollShift * 0.22}px; --scroll-soft-neg:${scrollShift * -0.22}px; --scroll-deep:${scrollShift * 0.45}px; --scroll-deep-neg:${scrollShift * -0.45}px;`}
>
  <div class="cyber-signal-layer" aria-hidden="true">
    <div class="cyber-reticle reticle-a"></div>
    <div class="cyber-reticle reticle-b"></div>
    <div class="cyber-data-rail rail-left">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="cyber-data-rail rail-right">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="cyber-corners">
      <span class="corner corner-a"></span>
      <span class="corner corner-b"></span>
      <span class="corner corner-c"></span>
      <span class="corner corner-d"></span>
    </div>
  </div>
  <div class="background-grid" aria-hidden="true"></div>
  <div class="pointer-glow" aria-hidden="true"></div>
  <div class="ambient-beam beam-left" aria-hidden="true"></div>
  <div class="ambient-beam beam-right" aria-hidden="true"></div>

  <section class="logo-stage reveal-block" data-section="hero" class:visible={visibleSections.hero}>
    <div class="logo-card wrap-no-interact-all">
      <img
        class="logo-mark"
        src="/icons/logo/FirstParty/elts-v1-nobg.png"
        alt="ELECTRIS logo"
      />
    </div>
  </section>

  <section class="hero-grid reveal-block" data-section="hero" class:visible={visibleSections.hero}>
    <div class="hero-copy">
      <p class="hero-kicker">{t('home.hero.kicker', 'By creators, for creators')}</p>
      <h1 class="hero-title">
        <span>{t('home.hero.title.line1', 'What you create')}</span>
        <span class="aspect">{t('home.hero.title.line2', 'is yours')}</span>
      </h1>
      <p class="manifesto-copy">
        {t(
          'home.hero.lead',
          'Because you were willing to put your heart to it.'
        )}
      </p>
      <div class="action-row">
        <a href="/about" class="info-buttons about-link wrap-no-interact-all">
          {t('home.hero.link.about', 'What ELECTRIS is')}
        </a>
        <a href={latestPostHref} class="info-buttons latest-link ghost wrap-no-interact-all">
          {t('home.hero.link.latest', 'Read the latest thought')}
        </a>
      </div>
    </div>

    <aside class="hero-frame slogan-frame wrap-no-interact-all">
      <div class="frame-lines" aria-hidden="true"></div>
      <p class="frame-label">{t('home.frame.label', 'Always on purpose')}</p>
      <p class="frame-quote">{t('site.slogan', 'Heart like a pen, On paper it bleeds')}</p>
      <p class="frame-copy">
        {t(
          'home.frame.copy',
          'Everything here was made by someone who meant it.'
        )}
      </p>
    </aside>
  </section>

  <section class="snapshot-section reveal-block" data-section="news" class:visible={visibleSections.news}>
    <div class="snapshot-header">
      <h2>{t('home.snapshot.title', 'Latest News')}</h2>
      <p class="news-intro">
        {t(
          'home.snapshot.lead',
          "Whatever we've been working on lately shows up here."
        )}
      </p>
    </div>

    {#await data.streamed.youtube}
      <YTSkeleton type="live" />
      <YTSkeleton type="row" count={2} />
    {:then youtubeData}
      {@const { liveAndUpcoming, displayVideos } = processYoutubeData(youtubeData, includeExcludedVideos)}
      
      <YTLive videos={liveAndUpcoming} />
      
      {#if displayVideos.length > 0}
        <div class="youtube-row" class:single={displayVideos.length === 1}>
          {#each displayVideos as video}
            <YouTube {video} big={displayVideos.length === 1} />
          {/each}
        </div>
      {/if}

      <div class="show-all-container">
        <a href="/news/videos/feed" class="show-all-link wrap-no-interact-all">
          <span>{t('home.snapshot.videos.cta', 'All videos')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    {:catch}
      <!-- Silently fail -->
    {/await}

    <div class="snapshot-grid">
      {#if latestPost}
        {@const currentCover = resolveCover(latestPost, themeState.resolvedColorScheme)}
        {@const latestPostTypographyStyle = resolvePostTypographyStyle(latestPost)}
        <a
          href={`/blog/thoughts/${latestPost.slug}?from=home`}
          class="news-card latest-blog wrap-no-interact-all"
          class:no-cover={!currentCover}
          style={latestPostTypographyStyle}
        >
          {#if currentCover}
            <div
              class="news-visual"
              style={`background-image: linear-gradient(160deg, rgba(8, 10, 9, 0.05), rgba(8, 10, 9, 0.55)), url(${currentCover});`}
            >
              <span class="news-badge">{t('home.snapshot.badge.latest', 'Latest blog post')}</span>
            </div>
          {/if}

          <div class="news-copy">
            <div class="news-meta">
              <time datetime={latestPost.date}>{latestPostDate}</time>
              {#if latestPost.readTime}
                <span>{latestPost.readTime} {t('home.snapshot.readtime', 'minute read')}</span>
              {/if}
              <span>{latestPost.author}</span>
            </div>

            <h3>{latestPost.title}</h3>
            <p>{latestPost.description}</p>

            <div class="news-tags">
              {#each latestPost.tags.slice(0, 4) as tag}
                <span>{tag}</span>
              {/each}
            </div>

            <span class="news-cta">{t('home.snapshot.cta', 'Read it')}</span>
          </div>
        </a>
      {:else}
        <a href="/blog" class="news-card latest-blog-empty no-cover wrap-no-interact-all">
          <div class="news-copy">
            <div class="news-meta">
              <span>{t('home.snapshot.badge.waiting', 'Waiting for first post')}</span>
            </div>
            <h3>{t('home.snapshot.empty.title', 'Nothing written yet.')}</h3>
            <p>
              {t(
                'home.snapshot.empty.body',
                "When there's something worth writing down, it'll show up here."
              )}
            </p>
            <span class="news-cta">{t('home.snapshot.empty.cta', 'Visit the blog')}</span>
          </div>
        </a>
      {/if}

      <div class="snapshot-side">
        {#each snapshotCards as card, index}
          <article
            class={`snapshot-mini ${card.slug} wrap-no-interact-all`}
            style={`--stagger:${index * 150}ms;`}
          >
            <span class="mini-label">{card.label}</span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        {/each}
      </div>
    </div>
  </section>
</div>

<style>
  .landing-page {
    --surface-border: color-mix(in srgb, var(--accent) 18%, transparent);
    --surface-border-strong: color-mix(in srgb, var(--accent) 32%, transparent);
    --surface-base: color-mix(in srgb, var(--surface-page) 82%, transparent);
    --surface-elevated: color-mix(in srgb, var(--surface-page) 90%, transparent);
    min-height: 100vh;
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: var(--layout-page-top) var(--layout-page-inline) var(--space-5);
    position: relative;
    overflow: clip;
    isolation: isolate;
  }

  .cyber-signal-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    z-index: -1;
    transition: opacity var(--duration-slow) var(--ease-out);
  }

  .cyber-reticle,
  .cyber-data-rail,
  .cyber-corners {
    position: absolute;
  }

  .cyber-reticle {
    border-radius: var(--radius-round);
    border: 1px solid color-mix(in srgb, var(--brand-electro) 22%, transparent);
    box-shadow:
      0 0 var(--space-5) color-mix(in srgb, var(--brand-electro) 12%, transparent),
      inset 0 0 var(--space-5) color-mix(in srgb, var(--accent) 8%, transparent);
    animation: reticle-drift 16s ease-in-out infinite;
  }

  .reticle-a {
    top: 8rem;
    right: 8%;
    width: 20rem;
    height: 20rem;
    transform: translateY(var(--scroll-soft-neg));
  }

  .reticle-b {
    top: 36rem;
    left: -3rem;
    width: 13rem;
    height: 13rem;
    border-style: dashed;
    animation-duration: 19s;
    animation-direction: reverse;
  }

  .cyber-data-rail {
    top: 10rem;
    bottom: 8rem;
    width: 3.5rem;
    display: grid;
    gap: var(--space-3);
    align-content: start;
  }

  .rail-left {
    left: -0.2rem;
  }

  .rail-right {
    right: -0.2rem;
  }

  .cyber-data-rail span {
    display: block;
    height: 2.25rem;
    border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    border-radius: var(--radius-md);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--brand-electro) 18%, transparent), transparent 58%),
      linear-gradient(90deg, transparent 0 28%, color-mix(in srgb, var(--accent) 18%, transparent) 28% 38%, transparent 38% 100%);
    box-shadow: inset 0 0 var(--space-4) color-mix(in srgb, var(--accent) 8%, transparent);
    animation: rail-pulse 4.8s ease-in-out infinite;
  }

  .cyber-data-rail span:nth-child(2) { animation-delay: -1.1s; }
  .cyber-data-rail span:nth-child(3) { animation-delay: -2.3s; }
  .cyber-data-rail span:nth-child(4) { animation-delay: -3.4s; }
  .cyber-data-rail span:nth-child(5) { animation-delay: -4.1s; }

  .cyber-corners {
    inset: 0;
  }

  .corner {
    position: absolute;
    width: 2.25rem;
    height: 2.25rem;
    border-color: color-mix(in srgb, var(--brand-electro) 40%, transparent);
    opacity: 0.65;
  }

  .corner-a {
    top: 5.25rem;
    left: 0.2rem;
    border-top: 1px solid;
    border-left: 1px solid;
  }

  .corner-b {
    top: 5.25rem;
    right: 0.2rem;
    border-top: 1px solid;
    border-right: 1px solid;
  }

  .corner-c {
    bottom: 1rem;
    left: 0.2rem;
    border-bottom: 1px solid;
    border-left: 1px solid;
  }

  .corner-d {
    bottom: 1rem;
    right: 0.2rem;
    border-bottom: 1px solid;
    border-right: 1px solid;
  }

  .background-grid,
  .pointer-glow,
  .ambient-beam {
    position: absolute;
    pointer-events: none;
    z-index: -2;
  }

  .background-grid {
    inset: 0;
    opacity: 0.45;
    background-image:
      linear-gradient(color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--brand-electro) 8%, transparent) 1px, transparent 1px);
    background-size: 6.75rem 6.75rem;
    mask: linear-gradient(180deg, transparent 0%, black 8%, black 88%, transparent 100%);
  }

  .pointer-glow {
    inset: -12rem;
    background:
      radial-gradient(circle at var(--pointer-x) var(--pointer-y), color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 28%),
      radial-gradient(circle at calc(var(--pointer-x) - 18%) calc(var(--pointer-y) + 12%), color-mix(in srgb, var(--brand-electro) 16%, transparent) 0%, transparent 26%),
      radial-gradient(circle at calc(var(--pointer-x) + 22%) calc(var(--pointer-y) - 18%), color-mix(in srgb, var(--brand-electris) 12%, transparent) 0%, transparent 24%);
    filter: blur(14px);
    opacity: 0.95;
  }

  .ambient-beam {
    top: -10%;
    bottom: -10%;
    width: 16rem;
    opacity: 0.35;
    filter: blur(12px);
    background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent) 22%, transparent), transparent);
    animation: beam-pulse 12s ease-in-out infinite;
  }

  .beam-left {
    left: -4rem;
    transform: rotate(8deg);
  }

  .beam-right {
    right: -3rem;
    transform: rotate(-10deg);
    animation-delay: -6s;
  }

  .reveal-block {
    opacity: 0;
    transform: translateY(2.5rem);
    transition:
      opacity 0.9s var(--ease-out),
      transform 0.9s var(--ease-spring);
  }

  .reveal-block.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .logo-stage {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-6);
    position: relative;
    z-index: var(--z-raised);
  }

  .logo-card {
    --logo-size: clamp(12rem, 24vw, 18rem);
    position: relative;
    width: min(100%, 26rem);
    padding: var(--space-5);
    border-radius: var(--radius-2xl);
    border: 1px solid var(--surface-border);
    overflow: hidden;
    isolation: isolate;
    background:
      radial-gradient(circle at 50% 34%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 48%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 90%, transparent), color-mix(in srgb, var(--surface-base) 96%, transparent));
    box-shadow: var(--shadow-md);
    transform: rotate(-1.15deg);
    transition:
      transform var(--duration-slow) var(--ease-out),
      border-color var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .logo-card::before {
    content: '';
    position: absolute;
    inset: var(--space-4);
    border-radius: calc(var(--radius-2xl) - var(--space-4));
    border: 1px solid color-mix(in srgb, var(--accent) 14%, transparent);
    background:
      linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--accent) 8%, transparent) 44%, transparent 72%),
      repeating-linear-gradient(90deg, transparent 0 1.35rem, color-mix(in srgb, var(--accent) 8%, transparent) 1.35rem 1.45rem);
    opacity: 0.8;
    pointer-events: none;
  }

  .logo-card::after {
    content: '';
    position: absolute;
    inset: auto var(--space-5) var(--space-4);
    height: 1px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand-electro) 34%, transparent), transparent);
    opacity: 0.7;
    pointer-events: none;
  }

  .logo-card:hover {
    transform: translateY(-0.35rem) rotate(-0.65deg);
    border-color: var(--surface-border-strong);
    box-shadow: var(--shadow-lg);
  }

  .logo-mark {
    position: relative;
    z-index: var(--z-raised);
    display: block;
    width: min(100%, var(--logo-size));
    margin: 0 auto;
    object-fit: contain;
    filter:
      drop-shadow(0 var(--space-4) 1.8rem color-mix(in srgb, var(--accent) 16%, transparent))
      drop-shadow(0 0 var(--space-4) color-mix(in srgb, var(--accent) 12%, transparent));
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.18fr) minmax(19rem, 0.82fr);
    gap: var(--space-5);
    align-items: end;
    margin-bottom: var(--space-7);
    position: relative;
  }

  .hero-grid::before {
    content: '';
    position: absolute;
    inset: auto 10% 0 30%;
    height: 24rem;
    border-radius: var(--radius-round);
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 16%, transparent), transparent 72%);
    transform: translateY(var(--scroll-soft-neg));
    filter: blur(18px);
    opacity: 0.8;
    z-index: -1;
  }

  .hero-copy {
    position: relative;
    z-index: var(--z-raised);
  }

  .hero-kicker,
  .frame-label,
  .mini-label,
  .news-meta {
    font-family: var(--font-body);
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .hero-kicker {
    margin: 0 0 var(--space-4);
    font-size: var(--text-sm);
    opacity: 0.78;
  }

  .hero-title {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    font-family: var(--font-display);
    font-size: var(--display-xl);
    line-height: 0.88;
    text-transform: uppercase;
    max-width: 10ch;
    text-wrap: balance;
  }

  .hero-title .aspect {
    color: color-mix(in srgb, var(--brand-electro) 54%, var(--accent) 46%);
    text-shadow: 0 0 var(--space-6) color-mix(in srgb, var(--brand-electro) 28%, transparent);
  }

  .manifesto-copy {
    max-width: 30rem;
    margin: var(--space-4) 0 var(--space-5);
    font-family: var(--font-body);
    font-size: var(--text-lg);
    line-height: 1.6;
    opacity: 0.94;
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .info-buttons {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--touch-target-size);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-pill);
    border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
    background: color-mix(in srgb, var(--surface-elevated) 92%, transparent);
    color: inherit;
    font-family: var(--font-ui);
    font-size: var(--text-2xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    box-shadow: var(--shadow-md);
    transition:
      transform var(--duration-slow) var(--ease-out),
      border-color var(--duration-slow) var(--ease-out),
      background var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .info-buttons:hover {
    transform: translateY(-0.2rem);
    border-color: color-mix(in srgb, var(--accent) 42%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, var(--surface-elevated));
    box-shadow: var(--shadow-lg);
  }

  .info-buttons.ghost {
    background: transparent;
  }

  .hero-frame {
    position: relative;
    min-height: 20rem;
    padding: var(--space-5);
    border-radius: var(--radius-2xl);
    border: 1px solid color-mix(in srgb, var(--brand-electro) 24%, transparent);
    background:
      radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--brand-electro) 12%, transparent), transparent 42%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 94%, transparent), color-mix(in srgb, var(--surface-base) 96%, transparent));
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transform: translateY(var(--scroll-soft-neg)) rotate(-4deg);
    transition:
      transform var(--duration-slow) var(--ease-out),
      border-color var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .hero-frame:hover {
    transform: translateY(calc(var(--scroll-soft-neg) - 0.4rem)) rotate(-4deg);
    border-color: color-mix(in srgb, var(--brand-electro) 38%, transparent);
    box-shadow: var(--shadow-lg);
  }

  .hero-frame::before {
    content: '';
    position: absolute;
    inset: var(--space-4);
    border-radius: calc(var(--radius-2xl) - var(--space-4));
    border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
    pointer-events: none;
  }

  .frame-lines {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--brand-electro) 8%, transparent) 36%, transparent 70%),
      repeating-linear-gradient(0deg, transparent 0 0.55rem, color-mix(in srgb, var(--accent) 8%, transparent) 0.55rem 0.65rem);
    opacity: 0.5;
  }

  .frame-label,
  .mini-label {
    font-size: var(--text-2xs);
    opacity: 0.78;
  }

  .frame-label,
  .frame-quote,
  .frame-copy {
    position: relative;
    z-index: var(--z-raised);
  }

  .frame-label {
    margin: 0 0 var(--space-5);
  }

  .frame-quote {
    margin: 0 0 var(--space-4);
    font-family: var(--font-display);
    font-size: var(--display-sm);
    line-height: 1.02;
    text-transform: uppercase;
    max-width: 10ch;
  }

  .frame-copy {
    margin: 0;
    max-width: 25rem;
    font-family: var(--font-body);
    font-size: var(--text-base);
    line-height: 1.6;
    opacity: 0.88;
  }

  .snapshot-mini,
  .news-card {
    transition:
      transform var(--duration-slow) var(--ease-out),
      border-color var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .snapshot-header h2,
  .snapshot-mini h3,
  .news-copy h3 {
    font-family: var(--font-display);
    text-transform: uppercase;
  }

  .snapshot-mini p,
  .news-copy p,
  .news-intro {
    font-family: var(--font-body);
  }

  .snapshot-section {
    margin-bottom: var(--space-5);
    margin-top: var(--space-8);
  }

  .snapshot-header {
    max-width: 46rem;
    margin-bottom: var(--space-5);
  }

  .snapshot-header h2 {
    margin: 0 0 var(--space-3);
    max-width: 11ch;
    font-size: var(--display-md);
    line-height: 0.94;
  }

  .news-intro {
    margin: 0;
    max-width: var(--layout-measure);
    font-size: var(--text-md);
    line-height: 1.7;
    opacity: 0.9;
  }

  .snapshot-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(19rem, 0.72fr);
    gap: var(--space-4);
    align-items: stretch;
  }

  .youtube-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
    align-items: start;
    margin-bottom: var(--space-4);
  }

  .youtube-row.single {
    grid-template-columns: 1fr;
  }

  .show-all-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--space-5);
  }

  .show-all-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--surface-elevated) 80%, transparent);
    border: 1px solid var(--surface-border);
    font-family: var(--font-game);
    font-size: var(--text-2xs);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    color: inherit;
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out);
  }

  .show-all-link:hover {
    background: color-mix(in srgb, var(--surface-elevated) 95%, transparent);
    border-color: var(--brand-electro);
    transform: translateX(0.35rem);
  }

  .show-all-link svg {
    width: 0.9rem;
    height: 0.9rem;
    transition: transform var(--duration-normal) var(--ease-out);
  }

  .show-all-link:hover svg {
    transform: translateX(0.2rem);
  }

  .news-card {
    min-height: 28rem;
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    border-radius: var(--radius-2xl);
    border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    overflow: hidden;
    background: color-mix(in srgb, var(--surface-elevated) 94%, transparent);
    box-shadow: var(--shadow-md);
  }

  .news-card:hover {
    transform: translateY(-0.45rem);
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
    box-shadow: var(--shadow-lg);
  }

  .news-card.no-cover {
    grid-template-columns: 1fr;
  }

  .news-visual {
    position: relative;
    min-height: 100%;
    background-size: cover;
    background-position: 20% center;
  }

  /* Sits on top of a cover image, so it stays dark in every scheme. */
  .news-visual::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.45)),
      radial-gradient(circle at 24% 24%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 44%);
    pointer-events: none;
  }

  .news-badge {
    position: absolute;
    top: var(--space-4);
    left: var(--space-4);
    z-index: var(--z-raised);
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    background: rgba(5, 8, 5, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.16);
    font-family: var(--font-game);
    font-size: var(--text-2xs);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-on-accent);
  }

  .news-copy {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--accent) 6%, transparent), transparent 38%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 96%, transparent), color-mix(in srgb, var(--surface-base) 98%, transparent));
  }

  .news-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    font-size: var(--text-2xs);
    opacity: 0.76;
  }

  .news-copy h3 {
    margin: 0 0 var(--space-3);
    max-width: 12ch;
    font-size: var(--display-sm);
    line-height: 0.96;
  }

  .latest-blog .news-copy h3 {
    font-family: var(--post-title-font, var(--font-display));
  }

  .news-copy p {
    margin: 0;
    max-width: 30rem;
    font-size: var(--text-base);
    line-height: 1.65;
    opacity: 0.92;
  }

  .latest-blog .news-copy p {
    font-family: var(--post-description-font, var(--font-body));
  }

  .news-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: auto;
    padding-top: var(--space-5);
  }

  .news-tags span {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    font-family: var(--font-game);
    font-size: var(--text-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .news-cta {
    display: inline-flex;
    align-items: center;
    margin-top: var(--space-4);
    font-family: var(--font-game);
    font-size: var(--text-2xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.82;
  }

  .snapshot-side {
    display: grid;
    gap: var(--space-4);
  }

  .snapshot-mini {
    position: relative;
    min-height: 13rem;
    padding: var(--space-5);
    border-radius: var(--radius-xl);
    border: 1px solid var(--surface-border);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--brand-electro) 7%, transparent), transparent 60%),
      color-mix(in srgb, var(--surface-elevated) 96%, transparent);
    box-shadow: var(--shadow-md);
  }

  .snapshot-mini:hover {
    transform: translateY(-0.35rem);
    border-color: color-mix(in srgb, var(--brand-electro) 24%, transparent);
    box-shadow: var(--shadow-lg);
  }

  .mini-label {
    display: block;
    margin-bottom: var(--space-3);
  }

  .snapshot-mini h3 {
    margin: 0 0 var(--space-3);
    font-size: var(--text-xl);
    line-height: 1.02;
  }

  .snapshot-mini p {
    margin: 0;
    font-size: var(--text-base);
    line-height: 1.65;
    opacity: 0.88;
  }

  @keyframes beam-pulse {
    0%,
    100% {
      opacity: 0.24;
    }
    50% {
      opacity: 0.52;
    }
  }

  @keyframes reticle-drift {
    0%,
    100% {
      transform: translateY(var(--scroll-soft-neg)) scale(1);
      opacity: 0.42;
    }
    50% {
      transform: translateY(calc(var(--scroll-soft-neg) - 0.7rem)) scale(1.04);
      opacity: 0.78;
    }
  }

  @keyframes rail-pulse {
    0%,
    100% {
      opacity: 0.34;
      transform: translateX(0);
    }
    50% {
      opacity: 0.9;
      transform: translateX(0.12rem);
    }
  }

  @media (max-width: 1200px) {
    .hero-grid,
    .snapshot-grid {
      grid-template-columns: 1fr;
    }

    .hero-frame {
      max-width: 34rem;
      transform: translateY(calc(var(--scroll-soft-neg) * 0.48)) rotate(-2.6deg);
    }

    .hero-frame:hover {
      transform: translateY(calc((var(--scroll-soft-neg) * 0.48) - 0.35rem)) rotate(-2.6deg);
    }

  }

  @media (max-width: 780px) {
    .cyber-data-rail {
      display: none;
    }

    .reticle-a {
      right: -2rem;
      width: 13rem;
      height: 13rem;
    }

    .reticle-b {
      top: 42rem;
      left: -2rem;
      width: 9rem;
      height: 9rem;
    }

    .hero-title {
      font-size: var(--display-lg);
    }

    .news-card {
      grid-template-columns: 1fr;
    }

    .news-visual {
      min-height: 14rem;
    }

    .snapshot-header h2 {
      max-width: 9ch;
    }
  }

  @media (max-width: 560px) {
    .cyber-reticle {
      opacity: 0.35;
    }

    .cyber-corners {
      display: none;
    }

    .logo-card,
    .snapshot-mini,
    .hero-frame,
    .news-copy {
      padding: var(--space-4);
    }

    .hero-frame {
      transform: translateY(calc(var(--scroll-soft-neg) * 0.32)) rotate(-1.8deg);
    }

    .hero-frame:hover {
      transform: translateY(calc((var(--scroll-soft-neg) * 0.32) - 0.24rem)) rotate(-1.8deg);
    }

    .news-copy h3 {
      max-width: none;
    }
  }

  :global([data-theme="cyber-neotic"]) .cyber-signal-layer {
    opacity: 1;
  }

  :global([data-theme="cyber-neotic"]) .landing-page {
    --surface-border: color-mix(in srgb, var(--accent) 26%, transparent);
    --surface-border-strong: color-mix(in srgb, var(--brand-electro) 34%, var(--accent) 30%);
  }

  :global([data-theme="cyber-neotic"]) .pointer-glow {
    background:
      radial-gradient(circle at var(--pointer-x) var(--pointer-y), color-mix(in srgb, var(--accent) 24%, transparent) 0%, transparent 24%),
      radial-gradient(circle at calc(var(--pointer-x) - 16%) calc(var(--pointer-y) + 11%), color-mix(in srgb, var(--brand-electro) 22%, transparent) 0%, transparent 23%),
      radial-gradient(circle at calc(var(--pointer-x) + 18%) calc(var(--pointer-y) - 12%), color-mix(in srgb, var(--brand-electris) 16%, transparent) 0%, transparent 21%);
    filter: blur(10px) saturate(125%);
  }

  :global([data-theme="cyber-neotic"]) .background-grid {
    opacity: 0.62;
    background-size: 4.75rem 4.75rem;
  }

  :global([data-theme="cyber-neotic"]) .logo-card,
  :global([data-theme="cyber-neotic"]) .snapshot-mini,
  :global([data-theme="cyber-neotic"]) .hero-frame,
  :global([data-theme="cyber-neotic"]) .news-card {
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
  }

  :global([data-theme="cyber-neotic"]) .logo-card {
    box-shadow:
      var(--shadow-md),
      0 0 var(--space-5) color-mix(in srgb, var(--accent) 12%, transparent),
      inset 0 0 var(--space-4) color-mix(in srgb, var(--brand-electro) 6%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .logo-card::before {
    border-color: color-mix(in srgb, var(--brand-electro) 22%, transparent);
    background:
      linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--brand-electro) 10%, transparent) 44%, transparent 72%),
      repeating-linear-gradient(90deg, transparent 0 1.15rem, color-mix(in srgb, var(--accent) 10%, transparent) 1.15rem 1.25rem);
  }

  :global([data-theme="cyber-neotic"]) .logo-mark {
    filter:
      drop-shadow(0 var(--space-4) 1.9rem color-mix(in srgb, var(--accent) 18%, transparent))
      drop-shadow(0 0 1.35rem color-mix(in srgb, var(--brand-electro) 12%, transparent));
  }

  :global([data-theme="cyber-neotic"]) .hero-frame {
    box-shadow:
      var(--shadow-lg),
      0 0 1.8rem color-mix(in srgb, var(--brand-electro) 12%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .hero-frame::after {
    content: '';
    position: absolute;
    inset: auto var(--space-4) var(--space-4);
    height: 1px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand-electro) 50%, transparent), transparent);
    box-shadow: 0 0 var(--space-3) color-mix(in srgb, var(--brand-electro) 16%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .frame-lines {
    opacity: 0.72;
  }

  :global([data-theme="cyber-neotic"]) .hero-kicker,
  :global([data-theme="cyber-neotic"]) .mini-label {
    text-shadow: 0 0 var(--space-3) color-mix(in srgb, var(--accent) 18%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .hero-title .aspect {
    text-shadow:
      0 0 var(--space-4) color-mix(in srgb, var(--brand-electro) 30%, transparent),
      0 0 var(--space-6) color-mix(in srgb, var(--accent) 18%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .info-buttons {
    border-color: color-mix(in srgb, var(--brand-electro) 24%, var(--accent) 22%);
    box-shadow:
      var(--shadow-md),
      inset 0 0 var(--space-4) color-mix(in srgb, var(--accent) 6%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .info-buttons:hover {
    box-shadow:
      var(--shadow-lg),
      0 0 1.3rem color-mix(in srgb, var(--brand-electro) 14%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .snapshot-mini {
    box-shadow:
      var(--shadow-md),
      inset 0 0 var(--space-4) color-mix(in srgb, currentColor 6%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .news-card {
    box-shadow:
      var(--shadow-md),
      0 0 var(--space-5) color-mix(in srgb, var(--accent) 10%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .news-badge {
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
  }
</style>
