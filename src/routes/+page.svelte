<script lang="ts">
  import { onMount } from 'svelte';
  import { t, i18nState } from '$lib/stores/i18n.svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';

  type HomeSection = 'hero' | 'pillars' | 'news' | 'note';

  let { data } = $props();

  let pointer = $state({ x: 50, y: 22 });
  let scrollShift = $state(0);
  let visibleSections = $state<Record<HomeSection, boolean>>({
    hero: false,
    pillars: false,
    news: false,
    note: false
  });

  let latestPost = $derived(data.latestPost ?? null);
  let latestPostHref = $derived(latestPost ? `/blog/thoughts/${latestPost.slug}` : '/blog');
  let latestPostDate = $derived(
    latestPost
      ? new Intl.DateTimeFormat(i18nState.currentLocale || 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(latestPost.date))
      : ''
  );

  let principleCards = $derived([
    {
      slug: 'make',
      aspect: 'electris',
      eyebrow: t('home.principle.make.eyebrow', 'Make'),
      title: t('home.principle.make.title', 'Take the work seriously.'),
      body: t(
        'home.principle.make.body',
        "A minute or a year, the time it takes does not make it any less yours. If it matters to you, it is worth carrying through."
      ),
      lift: '0rem'
    },
    {
      slug: 'share',
      aspect: 'electro',
      eyebrow: t('home.principle.share.eyebrow', 'Share'),
      title: t('home.principle.share.title', 'Let it leave the room.'),
      body: t(
        'home.principle.share.body',
        'It\'s easy to create for yourself, but creation is meant to be shared and enjoyed by many, so if you made something you like, maybe someone else will like it too.'
      ),
      lift: '1.8rem'
    },
    {
      slug: 'evolve',
      aspect: 'varrow',
      eyebrow: t('home.principle.evolve.eyebrow', 'Evolve'),
      title: t('home.principle.evolve.title', 'Let the vision change shape.'),
      body: t(
        'home.principle.evolve.body',
        'Sometimes your ideas inspire others to make something of their own. You might agree, disagree, like or dislike their creation, but remember that what you made inspired someone to make something new.'
      ),
      lift: '0.8rem'
    }
  ]);

  let snapshotCards = $derived([
    {
      slug: 'devlog',
      label: t('home.snapshot.devlog.label', 'Still Underway'),
      title: t('home.snapshot.devlog.title', 'Latest devlog'),
      body: t(
        'home.snapshot.devlog.body',
        'The will be news regarding the progress on our games.'
      )
    },
    {
      slug: 'music',
      label: t('home.snapshot.music.label', 'Still Underway'),
      title: t('home.snapshot.music.title', 'Latest music'),
      body: t(
        'home.snapshot.music.body',
        'The will be news regarding music we produce and/or share.'
      )
    }
  ]);

  useHoverConfig([
    {
      selectors: ['.logo-card'],
      className: 'hovered-home-logo',
      lockPosition: true,
      matchRotation: true,
      color: 'color-mix(in srgb, var(--color-primary) 78%, var(--color-electro) 22%)'
    },
    {
      selectors: ['.manifesto-link.about-link'],
      className: 'hovered-home-link-about',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-primary) 74%, var(--color-electris) 26%)'
    },
    {
      selectors: ['.manifesto-link.latest-link'],
      className: 'hovered-home-link-latest',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-electro) 62%, var(--color-primary) 38%)'
    },
    {
      selectors: ['.hero-frame.manifesto-frame'],
      className: 'hovered-home-manifesto-frame',
      lockPosition: true,
      matchRotation: true,
      color: 'color-mix(in srgb, var(--color-electro) 58%, var(--color-primary) 42%)'
    },
    {
      selectors: ['.signal-card.make'],
      className: 'hovered-home-make',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-primary) 76%, var(--color-electris) 24%)'
    },
    {
      selectors: ['.signal-card.share'],
      className: 'hovered-home-share',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-electro) 82%, var(--color-primary) 18%)'
    },
    {
      selectors: ['.signal-card.evolve'],
      className: 'hovered-home-evolve',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-varrow) 74%, var(--color-electro) 26%)'
    },
    {
      selectors: ['.news-card.latest-blog'],
      className: 'hovered-home-latest-big',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-primary) 68%, var(--color-electris) 32%)'
    },
    {
      selectors: ['.news-card.latest-blog-empty'],
      className: 'hovered-home-latest-big',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-primary) 58%, var(--color-varrow) 42%)'
    },
    {
      selectors: ['.snapshot-mini.devlog'],
      className: 'hovered-home-latest-small',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-electris) 50%, var(--color-electro) 50%)'
    },
    {
      selectors: ['.snapshot-mini.music'],
      className: 'hovered-home-latest-small',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-electris) 50%, var(--color-electro) 50%)'
    },
    {
      selectors: ['.restructure-note.footer-note'],
      className: 'hovered-home-footer',
      lockPosition: true,
      preventRotation: true
    },
    {
      selectors: ['.manifesto-copy', '.news-intro', '.note-copy'],
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

  function handlePointerMove(event: MouseEvent) {
    pointer.x = (event.clientX / window.innerWidth) * 100;
    pointer.y = (event.clientY / window.innerHeight) * 100;
  }

  function handleScroll() {
    scrollShift = Math.min(window.scrollY, window.innerHeight * 1.4);
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

    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = 'circle';
      }
    };

    setTimeout(cursorReset, 10);
    handleScroll();

    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>Home | ELECTRIS</title>
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
      <p class="hero-kicker">{t('home.hero.kicker', 'ELECTRIS // creative freedom')}</p>
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
        <a href="/about" class="manifesto-link about-link wrap-no-interact-all">
          {t('home.hero.link.about', 'Read About ELECTRIS')}
        </a>
        <a href={latestPostHref} class="manifesto-link latest-link ghost wrap-no-interact-all">
          {t('home.hero.link.latest', 'Open Latest Thought')}
        </a>
      </div>
    </div>

    <aside class="hero-frame manifesto-frame wrap-no-interact-all">
      <div class="frame-lines" aria-hidden="true"></div>
      <p class="frame-label">{t('home.frame.label', 'Always on purpose')}</p>
      <p class="frame-quote">{t('site.slogan', 'Heart like a pen, On paper it bleeds')}</p>
      <p class="frame-copy">
        {t(
          'home.frame.copy',
          'Still enough to build something, still keeping the lightning.'
        )}
      </p>
    </aside>
  </section>

  <section class="pillar-grid reveal-block" data-section="pillars" class:visible={visibleSections.pillars}>
    {#each principleCards as card, index}
      <article
        class={`signal-card ${card.slug} ${card.aspect} wrap-no-interact-all`}
        style={`--stagger:${index * 140}ms; --lift:${card.lift};`}
      >
        <span class="signal-eyebrow">{card.eyebrow}</span>
        <h2>{card.title}</h2>
        <p>{card.body}</p>
      </article>
    {/each}
  </section>

  <section class="snapshot-section reveal-block" data-section="news" class:visible={visibleSections.news}>
    <div class="snapshot-header">
      <p class="section-kicker">{t('home.latest-signal.kicker', 'Living snapshot')}</p>
      <h2>{t('home.snapshot.title', 'Latest Stuff')}</h2>
      <p class="news-intro">
        {t(
          'home.snapshot.lead',
          'This pulls the latest changes from ELECTRIS.'
        )}
      </p>
    </div>

    <div class="snapshot-grid">
      {#if latestPost}
        <a
          href={`/blog/thoughts/${latestPost.slug}`}
          class="news-card latest-blog wrap-no-interact-all"
          class:no-cover={!latestPost.coverImage}
        >
          {#if latestPost.coverImage}
            <div
              class="news-visual"
              style={`background-image: linear-gradient(160deg, rgba(8, 10, 9, 0.05), rgba(8, 10, 9, 0.55)), url(${latestPost.coverImage});`}
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

            <span class="news-cta">{t('home.snapshot.cta', 'Open latest post')}</span>
          </div>
        </a>
      {:else}
        <a href="/blog" class="news-card latest-blog-empty no-cover wrap-no-interact-all">
          <div class="news-copy">
            <div class="news-meta">
              <span>{t('home.snapshot.badge.waiting', 'Waiting for first post')}</span>
            </div>
            <h3>{t('home.snapshot.empty.title', 'The first signal lands here.')}</h3>
            <p>
              {t(
                'home.snapshot.empty.body',
                'Once coherent thought is formed, this card will start carrying the newest writing on the site.'
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

  <footer class="rebuild-zone">
    <div class="restructure-note footer-note wrap-no-interact-all">
      <div class="note-gears" aria-hidden="true">
        <div class="gear footer-gear gear-large"></div>
        <div class="gear footer-gear gear-small"></div>
      </div>
      <div class="note-text">
        <p class="note-kicker">{t('update.title')}</p>
        <p class="note-copy">
          {t(
            'home.note.copy',
            'The restructure is still underway, but we\'re really close to being done.'
          )}
        </p>
      </div>
    </div>
  </footer>
</div>

<style>
  .landing-page {
    --surface-border: color-mix(in srgb, var(--color-primary) 18%, transparent);
    --surface-border-strong: color-mix(in srgb, var(--color-primary) 32%, transparent);
    --surface-base: color-mix(in srgb, var(--bg-body) 82%, transparent);
    --surface-elevated: color-mix(in srgb, var(--bg-body) 90%, transparent);
    min-height: 100vh;
    max-width: 1600px;
    margin: 0 auto;
    padding: 7rem clamp(1.25rem, 3.4vw, 3.6rem) 4rem;
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
    transition: opacity 0.35s ease;
  }

  .cyber-reticle,
  .cyber-data-rail,
  .cyber-corners {
    position: absolute;
  }

  .cyber-reticle {
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--color-electro) 22%, transparent);
    box-shadow:
      0 0 1.5rem color-mix(in srgb, var(--color-electro) 12%, transparent),
      inset 0 0 1.4rem color-mix(in srgb, var(--color-primary) 8%, transparent);
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
    width: 3.4rem;
    display: grid;
    gap: 0.85rem;
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
    height: 2.3rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
    border-radius: 0.8rem;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--color-electro) 18%, transparent), transparent 58%),
      linear-gradient(90deg, transparent 0 28%, color-mix(in srgb, var(--color-primary) 18%, transparent) 28% 38%, transparent 38% 100%);
    box-shadow: inset 0 0 1rem color-mix(in srgb, var(--color-primary) 8%, transparent);
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
    width: 2.2rem;
    height: 2.2rem;
    border-color: color-mix(in srgb, var(--color-electro) 40%, transparent);
    opacity: 0.65;
  }

  .corner-a {
    top: 5.2rem;
    left: 0.2rem;
    border-top: 1px solid;
    border-left: 1px solid;
  }

  .corner-b {
    top: 5.2rem;
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
      linear-gradient(color-mix(in srgb, var(--color-primary) 10%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--color-electro) 8%, transparent) 1px, transparent 1px);
    background-size: 6.8rem 6.8rem;
    mask: linear-gradient(180deg, transparent 0%, black 8%, black 88%, transparent 100%);
  }

  .pointer-glow {
    inset: -12rem;
    background:
      radial-gradient(circle at var(--pointer-x) var(--pointer-y), color-mix(in srgb, var(--color-primary) 20%, transparent) 0%, transparent 28%),
      radial-gradient(circle at calc(var(--pointer-x) - 18%) calc(var(--pointer-y) + 12%), color-mix(in srgb, var(--color-electro) 16%, transparent) 0%, transparent 26%),
      radial-gradient(circle at calc(var(--pointer-x) + 22%) calc(var(--pointer-y) - 18%), color-mix(in srgb, var(--color-varrow) 12%, transparent) 0%, transparent 24%);
    filter: blur(14px);
    opacity: 0.95;
  }

  .ambient-beam {
    top: -10%;
    bottom: -10%;
    width: 16rem;
    opacity: 0.35;
    filter: blur(12px);
    background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent);
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
      opacity 0.9s ease,
      transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .reveal-block.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .logo-stage {
    display: flex;
    justify-content: center;
    margin-bottom: 2.35rem;
    position: relative;
    z-index: 1;
  }

  .logo-card {
    --logo-size: clamp(12rem, 24vw, 18rem);
    position: relative;
    width: min(100%, 26rem);
    padding: 1.4rem;
    border-radius: 2.25rem;
    border: 1px solid var(--surface-border);
    overflow: hidden;
    isolation: isolate;
    background:
      radial-gradient(circle at 50% 34%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 48%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 90%, transparent), color-mix(in srgb, var(--surface-base) 96%, transparent));
    box-shadow: 0 1.15rem 2.8rem rgba(0, 0, 0, 0.14);
    transform: rotate(-1.15deg);
    transition:
      transform 0.35s ease,
      border-color 0.35s ease,
      box-shadow 0.35s ease;
  }

  .logo-card::before {
    content: '';
    position: absolute;
    inset: 0.95rem;
    border-radius: 1.5rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 14%, transparent);
    background:
      linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--color-primary) 8%, transparent) 44%, transparent 72%),
      repeating-linear-gradient(90deg, transparent 0 1.35rem, color-mix(in srgb, var(--color-primary) 8%, transparent) 1.35rem 1.45rem);
    opacity: 0.8;
    pointer-events: none;
  }

  .logo-card::after {
    content: '';
    position: absolute;
    inset: auto 1.25rem 1.1rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-electro) 34%, transparent), transparent);
    opacity: 0.7;
    pointer-events: none;
  }

  .logo-card:hover {
    transform: translateY(-0.35rem) rotate(-0.65deg);
    border-color: var(--surface-border-strong);
    box-shadow: 0 1.35rem 3rem rgba(0, 0, 0, 0.2);
  }

  .logo-mark {
    position: relative;
    z-index: 1;
    display: block;
    width: min(100%, var(--logo-size));
    margin: 0 auto;
    object-fit: contain;
    filter:
      drop-shadow(0 1rem 1.8rem color-mix(in srgb, var(--color-primary) 16%, transparent))
      drop-shadow(0 0 1.1rem color-mix(in srgb, var(--color-primary) 12%, transparent));
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.18fr) minmax(19rem, 0.82fr);
    gap: 1.5rem;
    align-items: end;
    margin-bottom: 3rem;
    position: relative;
  }

  .hero-grid::before {
    content: '';
    position: absolute;
    inset: auto 10% 0 30%;
    height: 24rem;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 72%);
    transform: translateY(var(--scroll-soft-neg));
    filter: blur(18px);
    opacity: 0.8;
    z-index: -1;
  }

  .hero-copy {
    position: relative;
    z-index: 1;
  }

  .hero-kicker,
  .section-kicker,
  .signal-eyebrow,
  .frame-label,
  .mini-label,
  .news-meta,
  .note-kicker {
    font-family: 'Nightcore', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .hero-kicker {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    opacity: 0.78;
  }

  .hero-title {
    margin: 0;
    display: grid;
    gap: 0.35rem;
    font-family: 'Letric', sans-serif;
    font-size: clamp(4rem, 10vw, 8.5rem);
    line-height: 0.88;
    text-transform: uppercase;
    max-width: 10ch;
    text-wrap: balance;
  }

  .hero-title .aspect {
    color: color-mix(in srgb, var(--color-electro) 54%, var(--color-primary) 46%);
    text-shadow: 0 0 2rem color-mix(in srgb, var(--color-electro) 28%, transparent);
  }

  .manifesto-copy {
    max-width: 40rem;
    margin: 1.3rem 0 1.75rem;
    font-family: 'Redwing', sans-serif;
    font-size: clamp(1.08rem, 2vw, 1.42rem);
    line-height: 1.6;
    opacity: 0.94;
  }

  .action-row,
  .note-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
  }

  .manifesto-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.9rem 1.25rem;
    border-radius: 2.5vmin;
    border: 1px solid color-mix(in srgb, var(--color-primary) 24%, transparent);
    background: color-mix(in srgb, var(--surface-elevated) 92%, transparent);
    color: inherit;
    font-family: sans-serif;
    font-size: 0.78rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    transition:
      transform 0.3s ease,
      border-color 0.3s ease,
      background 0.3s ease,
      box-shadow 0.3s ease;
    box-shadow: 0 0.8rem 2.2rem rgba(0, 0, 0, 0.12);
  }

  .manifesto-link:hover {
    transform: translateY(-0.2rem);
    border-color: color-mix(in srgb, var(--color-primary) 42%, transparent);
    background: color-mix(in srgb, var(--color-primary) 12%, var(--surface-elevated));
    box-shadow: 0 1rem 2.4rem rgba(0, 0, 0, 0.18);
  }

  .manifesto-link.ghost {
    background: transparent;
  }

  .manifesto-link.small {
    padding: 0.75rem 1rem;
    font-size: 0.72rem;
  }

  .hero-frame {
    position: relative;
    min-height: 20rem;
    padding: 1.45rem;
    border-radius: 1.8rem;
    border: 1px solid color-mix(in srgb, var(--color-electro) 24%, transparent);
    background:
      radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-electro) 12%, transparent), transparent 42%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 94%, transparent), color-mix(in srgb, var(--surface-base) 96%, transparent));
    box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.16);
    overflow: hidden;
    transform: translateY(var(--scroll-soft-neg)) rotate(-4deg);
    transition:
      transform 0.4s ease,
      border-color 0.4s ease,
      box-shadow 0.4s ease;
  }

  .hero-frame:hover {
    transform: translateY(calc(var(--scroll-soft-neg) - 0.4rem)) rotate(-4deg);
    border-color: color-mix(in srgb, var(--color-electro) 38%, transparent);
    box-shadow: 0 1.8rem 3.2rem rgba(0, 0, 0, 0.22);
  }

  .hero-frame::before {
    content: '';
    position: absolute;
    inset: 0.9rem;
    border-radius: 1.3rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
    pointer-events: none;
  }

  .frame-lines {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--color-electro) 8%, transparent) 36%, transparent 70%),
      repeating-linear-gradient(0deg, transparent 0 0.55rem, color-mix(in srgb, var(--color-primary) 8%, transparent) 0.55rem 0.65rem);
    opacity: 0.5;
  }

  .frame-label,
  .mini-label,
  .section-kicker {
    font-size: 0.78rem;
    opacity: 0.78;
  }

  .frame-label,
  .frame-quote,
  .frame-copy {
    position: relative;
    z-index: 1;
  }

  .frame-label {
    margin: 0 0 1.4rem;
  }

  .frame-quote {
    margin: 0 0 1rem;
    font-family: 'Letric', sans-serif;
    font-size: clamp(2rem, 4vw, 3.1rem);
    line-height: 1.02;
    text-transform: uppercase;
    max-width: 10ch;
  }

  .frame-copy {
    margin: 0;
    max-width: 25rem;
    font-family: 'Redwing', sans-serif;
    font-size: 1.05rem;
    line-height: 1.6;
    opacity: 0.88;
  }

  .pillar-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 4rem;
  }

  .signal-card,
  .snapshot-mini,
  .news-card {
    transition:
      transform 0.4s ease,
      border-color 0.35s ease,
      box-shadow 0.35s ease;
  }

  .signal-card {
    position: relative;
    min-height: 18rem;
    padding: 1.45rem;
    border-radius: 1.65rem;
    border: 1px solid var(--surface-border);
    overflow: hidden;
    background: linear-gradient(180deg, color-mix(in srgb, currentColor 8%, transparent), transparent 68%), color-mix(in srgb, var(--surface-elevated) 92%, transparent);
    box-shadow: 0 1rem 2.8rem rgba(0, 0, 0, 0.12);
    transform: translateY(var(--lift));
  }

  .signal-card::after {
    content: '';
    position: absolute;
    inset: auto 0.65rem 0.65rem;
    height: 34%;
    border-radius: 1.1rem;
    background: linear-gradient(180deg, transparent, color-mix(in srgb, currentColor 10%, transparent));
    opacity: 0.42;
    pointer-events: none;
  }

  .signal-card:hover {
    transform: translateY(calc(var(--lift) - 0.45rem));
    border-color: color-mix(in srgb, currentColor 28%, transparent);
    box-shadow: 0 1.3rem 3rem rgba(0, 0, 0, 0.18);
  }

  .signal-card.electris {
    color: var(--color-primary);
  }

  .signal-card.electro {
    color: var(--color-electro);
  }

  .signal-card.varrow {
    color: var(--color-varrow);
  }

  .signal-eyebrow {
    position: relative;
    z-index: 1;
    display: block;
    margin-bottom: 1rem;
    font-size: 0.78rem;
    opacity: 0.82;
  }

  .signal-card h2,
  .snapshot-header h2,
  .snapshot-mini h3,
  .news-copy h3 {
    font-family: 'Letric', sans-serif;
    text-transform: uppercase;
  }

  .signal-card h2 {
    position: relative;
    z-index: 1;
    max-width: 10ch;
    margin: 0 0 1rem;
    font-size: 2.15rem;
    line-height: 1.02;
  }

  .signal-card p,
  .snapshot-mini p,
  .news-copy p,
  .note-copy,
  .news-intro {
    font-family: 'Redwing', sans-serif;
  }

  .signal-card p {
    position: relative;
    z-index: 1;
    margin: 0;
    max-width: 25rem;
    font-size: 1.05rem;
    line-height: 1.62;
  }

  .snapshot-section {
    margin-bottom: 4rem;
  }

  .snapshot-header {
    max-width: 46rem;
    margin-bottom: 1.6rem;
  }

  .section-kicker {
    margin: 0 0 0.9rem;
  }

  .snapshot-header h2 {
    margin: 0 0 0.9rem;
    max-width: 11ch;
    font-size: clamp(2.8rem, 6vw, 4.3rem);
    line-height: 0.94;
  }

  .news-intro {
    margin: 0;
    max-width: 38rem;
    font-size: 1.1rem;
    line-height: 1.7;
    opacity: 0.9;
  }

  .snapshot-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(19rem, 0.72fr);
    gap: 1rem;
    align-items: stretch;
  }

  .news-card {
    min-height: 28rem;
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    border-radius: 2rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
    overflow: hidden;
    background: color-mix(in srgb, var(--surface-elevated) 94%, transparent);
    box-shadow: 0 1.4rem 3rem rgba(0, 0, 0, 0.14);
  }

  .news-card:hover {
    transform: translateY(-0.45rem);
    border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
    box-shadow: 0 1.8rem 3.4rem rgba(0, 0, 0, 0.2);
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

  .news-visual::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.45)),
      radial-gradient(circle at 24% 24%, color-mix(in srgb, var(--color-primary) 20%, transparent), transparent 44%);
    pointer-events: none;
  }

  .news-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    padding: 0.55rem 0.85rem;
    border-radius: 999px;
    background: rgba(5, 8, 5, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.16);
    font-family: 'Nightcore', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #f8f8f8;
  }

  .news-copy {
    padding: 1.55rem;
    display: flex;
    flex-direction: column;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 38%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 96%, transparent), color-mix(in srgb, var(--surface-base) 98%, transparent));
  }

  .news-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-bottom: 1rem;
    font-size: 0.76rem;
    opacity: 0.76;
  }

  .news-copy h3 {
    margin: 0 0 0.9rem;
    max-width: 12ch;
    font-size: clamp(2.15rem, 4vw, 3.4rem);
    line-height: 0.96;
  }

  .news-copy p {
    margin: 0;
    max-width: 30rem;
    font-size: 1.05rem;
    line-height: 1.65;
    opacity: 0.92;
  }

  .news-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    margin-top: auto;
    padding-top: 1.35rem;
  }

  .news-tags span {
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    font-family: 'Nightcore', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .news-cta {
    display: inline-flex;
    align-items: center;
    margin-top: 1rem;
    font-family: 'Nightcore', sans-serif;
    font-size: 0.78rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.82;
  }

  .snapshot-side {
    display: grid;
    gap: 1rem;
  }

  .snapshot-mini {
    position: relative;
    min-height: 13rem;
    padding: 1.35rem;
    border-radius: 1.5rem;
    border: 1px solid var(--surface-border);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--color-electro) 7%, transparent), transparent 60%),
      color-mix(in srgb, var(--surface-elevated) 96%, transparent);
    box-shadow: 0 1rem 2.6rem rgba(0, 0, 0, 0.12);
  }

  .snapshot-mini:hover {
    transform: translateY(-0.35rem);
    border-color: color-mix(in srgb, var(--color-electro) 24%, transparent);
    box-shadow: 0 1.3rem 2.8rem rgba(0, 0, 0, 0.18);
  }

  .mini-label {
    display: block;
    margin-bottom: 0.8rem;
  }

  .snapshot-mini h3 {
    margin: 0 0 0.85rem;
    font-size: 1.7rem;
    line-height: 1.02;
  }

  .snapshot-mini p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.65;
    opacity: 0.88;
  }

  .rebuild-zone {
    margin-top: 1.4rem;
    padding: 1.2rem 0 0.35rem;
    border-top: 1px solid color-mix(in srgb, var(--color-primary) 14%, transparent);
  }

  .restructure-note {
    max-width: 48rem;
    margin: 0 auto;
    padding: 0.2rem 0;
    display: flex;
    align-items: center;
    gap: 0.9rem;
    opacity: 0.78;
    transition: opacity 0.25s ease, color 0.25s ease;
  }

  .restructure-note:hover {
    opacity: 1;
  }

  .note-gears {
    position: relative;
    width: 3.7rem;
    height: 2.8rem;
    flex: 0 0 auto;
    opacity: 0.72;
    filter: drop-shadow(0 0 0.6rem color-mix(in srgb, var(--color-primary) 12%, transparent));
  }

  .footer-gear {
    position: absolute;
    border-radius: 50%;
    animation: footer-rotate 6.5s linear infinite;
  }

  .gear-large {
    width: 2.2rem;
    height: 2.2rem;
    top: 0;
    left: 0;
  }

  .gear-small {
    width: 1.45rem;
    height: 1.45rem;
    right: 0.15rem;
    bottom: 0.1rem;
    animation-direction: reverse;
    animation-duration: 4.8s;
  }

  .note-text {
    position: relative;
    min-width: 0;
    display: grid;
    gap: 0.18rem;
  }

  .note-kicker {
    margin: 0;
    font-size: 0.66rem;
    opacity: 0.74;
  }

  .note-copy {
    max-width: 42rem;
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.55;
    opacity: 0.82;
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

  @keyframes footer-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
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

    .pillar-grid {
      grid-template-columns: 1fr;
    }

    .signal-card {
      transform: none;
    }

    .signal-card:hover {
      transform: translateY(-0.35rem);
    }
  }

  @media (max-width: 780px) {
    .landing-page {
      padding-top: 6rem;
    }

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
      font-size: clamp(3.3rem, 14vw, 5.6rem);
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
    .landing-page {
      padding-inline: 1rem;
    }

    .cyber-reticle {
      opacity: 0.35;
    }

    .cyber-corners {
      display: none;
    }

    .logo-card,
    .signal-card,
    .snapshot-mini,
    .hero-frame,
    .news-copy {
      padding: 1.15rem;
    }

    .hero-frame {
      transform: translateY(calc(var(--scroll-soft-neg) * 0.32)) rotate(-1.8deg);
    }

    .hero-frame:hover {
      transform: translateY(calc((var(--scroll-soft-neg) * 0.32) - 0.24rem)) rotate(-1.8deg);
    }

    .news-copy h3,
    .signal-card h2 {
      max-width: none;
    }

    .restructure-note {
      align-items: flex-start;
      gap: 0.75rem;
    }

    .note-gears {
      width: 3.2rem;
      height: 2.4rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ambient-beam,
    .footer-gear,
    .cyber-reticle,
    .cyber-data-rail span {
      animation: none;
    }

    .reveal-block,
    .logo-card,
    .signal-card,
    .snapshot-mini,
    .restructure-note,
    .news-card,
    .manifesto-link,
    .hero-frame {
      transition: none;
    }
  }

  :global([data-theme="cyber-neotic"]) .cyber-signal-layer {
    opacity: 1;
  }

  :global([data-theme="cyber-neotic"]) .landing-page {
    --surface-border: color-mix(in srgb, var(--color-primary) 26%, transparent);
    --surface-border-strong: color-mix(in srgb, var(--color-electro) 34%, var(--color-primary) 30%);
  }

  :global([data-theme="cyber-neotic"]) .pointer-glow {
    background:
      radial-gradient(circle at var(--pointer-x) var(--pointer-y), color-mix(in srgb, var(--color-primary) 24%, transparent) 0%, transparent 24%),
      radial-gradient(circle at calc(var(--pointer-x) - 16%) calc(var(--pointer-y) + 11%), color-mix(in srgb, var(--color-electro) 22%, transparent) 0%, transparent 23%),
      radial-gradient(circle at calc(var(--pointer-x) + 18%) calc(var(--pointer-y) - 12%), color-mix(in srgb, var(--color-varrow) 16%, transparent) 0%, transparent 21%);
    filter: blur(10px) saturate(125%);
  }

  :global([data-theme="cyber-neotic"]) .background-grid {
    opacity: 0.62;
    background-size: 4.8rem 4.8rem;
  }

  :global([data-theme="cyber-neotic"]) .logo-card,
  :global([data-theme="cyber-neotic"]) .signal-card,
  :global([data-theme="cyber-neotic"]) .snapshot-mini,
  :global([data-theme="cyber-neotic"]) .hero-frame,
  :global([data-theme="cyber-neotic"]) .news-card {
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
  }

  :global([data-theme="cyber-neotic"]) .logo-card {
    box-shadow:
      0 1rem 2.5rem rgba(0, 0, 0, 0.18),
      0 0 1.6rem color-mix(in srgb, var(--color-primary) 12%, transparent),
      inset 0 0 1rem color-mix(in srgb, var(--color-electro) 6%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .logo-card::before {
    border-color: color-mix(in srgb, var(--color-electro) 22%, transparent);
    background:
      linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--color-electro) 10%, transparent) 44%, transparent 72%),
      repeating-linear-gradient(90deg, transparent 0 1.15rem, color-mix(in srgb, var(--color-primary) 10%, transparent) 1.15rem 1.25rem);
  }

  :global([data-theme="cyber-neotic"]) .logo-mark {
    filter:
      drop-shadow(0 1rem 1.9rem color-mix(in srgb, var(--color-primary) 18%, transparent))
      drop-shadow(0 0 1.35rem color-mix(in srgb, var(--color-electro) 12%, transparent));
  }

  :global([data-theme="cyber-neotic"]) .hero-frame {
    box-shadow:
      0 1.8rem 3rem rgba(0, 0, 0, 0.2),
      0 0 1.8rem color-mix(in srgb, var(--color-electro) 12%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .hero-frame::after {
    content: '';
    position: absolute;
    inset: auto 1rem 1rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-electro) 50%, transparent), transparent);
    box-shadow: 0 0 0.8rem color-mix(in srgb, var(--color-electro) 16%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .frame-lines {
    opacity: 0.72;
  }

  :global([data-theme="cyber-neotic"]) .hero-kicker,
  :global([data-theme="cyber-neotic"]) .section-kicker,
  :global([data-theme="cyber-neotic"]) .signal-eyebrow,
  :global([data-theme="cyber-neotic"]) .mini-label,
  :global([data-theme="cyber-neotic"]) .note-kicker {
    text-shadow: 0 0 0.8rem color-mix(in srgb, var(--color-primary) 18%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .hero-title .aspect {
    text-shadow:
      0 0 1rem color-mix(in srgb, var(--color-electro) 30%, transparent),
      0 0 2rem color-mix(in srgb, var(--color-primary) 18%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .manifesto-link {
    border-color: color-mix(in srgb, var(--color-electro) 24%, var(--color-primary) 22%);
    box-shadow:
      0 0.8rem 2.2rem rgba(0, 0, 0, 0.16),
      inset 0 0 1rem color-mix(in srgb, var(--color-primary) 6%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .manifesto-link:hover {
    box-shadow:
      0 1rem 2.4rem rgba(0, 0, 0, 0.22),
      0 0 1.3rem color-mix(in srgb, var(--color-electro) 14%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .signal-card,
  :global([data-theme="cyber-neotic"]) .snapshot-mini {
    box-shadow:
      0 1rem 2.8rem rgba(0, 0, 0, 0.18),
      inset 0 0 1rem color-mix(in srgb, currentColor 6%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .news-card {
    box-shadow:
      0 1.4rem 3rem rgba(0, 0, 0, 0.2),
      0 0 1.6rem color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .news-badge,
  :global([data-theme="cyber-neotic"]) .note-status {
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
  }

  :global([data-theme="cyber-neotic"]) .restructure-note {
    opacity: 0.9;
  }

  :global([data-theme="cyber-neotic"]) .note-gears {
    opacity: 0.88;
  }

  :global([data-theme="cyber-neotic"]) .footer-gear {
    box-shadow: 0 0 0.9rem color-mix(in srgb, var(--gear-border) 16%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .footer-gear::after {
    content: '';
    position: absolute;
    inset: 22%;
    border: 1px solid color-mix(in srgb, var(--gear-border) 30%, transparent);
    border-radius: 50%;
  }
</style>
