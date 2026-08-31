<script lang="ts">
  import { t } from '$lib/state/i18n.svelte';
  import { onMount } from 'svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';

  useHoverConfig([
    {
      selectors: ['.card'],
      className: 'hovered-social-card',
      lockPosition: true
    },
    {
      type: ['h2'],
      selectors: ['.section-title'],
      className: 'hovered-section-title',
      wrapText: {
        sentences: true
      },
      lockPosition: true
    },
    {
      selectors: ['.section-logo', '.member-logo'],
      className: 'hovered-social-icon',
      lockPosition: true
    }
  ]);

  onMount(() => {
    const orbitReset = () => {
      const orbit = document.querySelector('.circle');
      if (orbit) {
        orbit.className = 'circle';
      }
    };

    setTimeout(orbitReset, 10);
  });

  const projectLinks = $derived([
    {
      title: t('site.platform.yt'),
      handle: 'ELECTRIS',
      description: t('social.elts.yt.desc'),
      platformLogo: '/icons/logo/ThirdParty/yt.svg',
      url: 'https://youtube.com/@ELECTRIS'
    },
    {
      title: t('site.platform.ma'),
      handle: 'ELECTRIS',
      description: t('social.mastodon.desc'),
      platformLogo: '/icons/logo/ThirdParty/mastodon.svg',
      url: 'https://mastodon.social/@ELECTRIS'
    },
    {
      title: t('site.platform.mx'),
      handle: t('social.server.name'),
      description: t('social.matrix.desc'),
      platformLogo: '/icons/logo/ThirdParty/matrix.svg',
      url: '#',
      status: 'coming-soon'
    },
    {
      title: t('site.platform.ds'),
      handle: t('social.server.name'),
      description: t('social.discord.desc'),
      platformLogo: '/icons/logo/ThirdParty/discord.svg',
      url: 'https://discord.gg/TgtCGKxbZr',
      status: 'deprecated'
    }
  ]);

  const founderLinks = $derived([
    {
      title: t('site.platform.yt'),
      handle: 'ELEC7RO',
      description: t('site.author.eltr.slogan'),
      platformLogo: '/icons/logo/ThirdParty/yt.svg',
      url: 'https://youtube.com/@ELEC7RO'
    },
    {
      title: t('site.platform.gh'),
      handle: 'ItzELECTR0',
      description: t('social.eltr.gh.desc'),
      platformLogo: '/icons/logo/ThirdParty/github.svg',
      url: 'https://github.com/ItzELECTR0'
    }
  ]);

  const contributorLinks = $derived([
    {
      title: t('site.platform.yt'),
      handle: 'V4rrow',
      description: t('social.vrrw.yt.desc'),
      platformLogo: '/icons/logo/ThirdParty/yt.svg',
      url: 'https://youtube.com/@V4rrow'
    },
    {
      title: t('site.platform.gh'),
      handle: 'Varrow1',
      description: t('social.vrrw.gh.desc'),
      platformLogo: '/icons/logo/ThirdParty/github.svg',
      url: 'https://github.com/Varrow1'
    },
    {
      title: t('site.platform.x'),
      handle: '0xVarrow',
      description: t('social.vrrw.x.desc'),
      platformLogo: '/icons/logo/ThirdParty/twitter.svg',
      url: 'https://x.com/0xVarrow'
    }
  ]);
</script>

<svelte:head>
  <title>Socials | ELECTRIS</title>
</svelte:head>

<div class="socials-page">
  <div class="hero">
    <h1 class="wrap-sentence">{t('social.title')}</h1>
    <p>{t('social.undertitle')}</p>
  </div>

  <div class="hub-container">
    <section class="hub-section">
      <div class="section-header">
        <img src="/icons/logo/FirstParty/elts-v1.png" alt="ELECTRIS" class="section-logo" />
        <h2 class="section-title">{t('social.section.project')}</h2>
      </div>
      <div class="grid">
        {#each projectLinks as link}
          <a
            class="card wrap-no-interact-all {link.status || ''}"
            href={link.url}
            target={link.url === '#' ? '_self' : '_blank'}
            rel="noopener noreferrer"
          >
            <div class="icons">
              <img src={link.platformLogo} alt={link.title} class="platform-icon" />
            </div>
            <div class="card-text">
              <div class="card-header">
                <h2>{link.title}</h2>
                <span class="platform-tag" class:tag-brand={link.handle === 'ELECTRIS'}>{link.handle}</span>
              </div>
              <p>{link.description}</p>
              {#if link.status}
                <span class="status-badge {link.status}">{link.status.replace('-', ' ')}</span>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </section>

    <section class="hub-section team-section">
      <div class="section-header main-team-header">
        <h2 class="section-title">{t('social.section.team')}</h2>
      </div>

      <div class="team-split">
        <div class="team-member-group">
          <div class="member-header">
            <img src="/icons/logo/FirstParty/eltr-v10.png" alt="ELECTRO" class="member-logo" />
            <div class="member-name">
              <h3>{t('site.author.eltr')}</h3>
              <p class="member-role">{t('social.role.founder', 'Founder')}</p>
            </div>
          </div>
          <div class="grid grid-small">
            {#each founderLinks as link}
              <a class="card card-compact wrap-no-interact-all" href={link.url} target="_blank" rel="noopener noreferrer">
                <div class="icons">
                  <img src={link.platformLogo} alt={link.title} class="platform-icon" />
                </div>
                <div class="card-text">
                  <div class="card-header">
                    <h2>{link.title}</h2>
                    <span class="platform-tag">{link.handle}</span>
                  </div>
                  <p>{link.description}</p>
                </div>
              </a>
            {/each}
          </div>
        </div>

        <div class="team-member-group">
          <div class="member-header">
            <img src="/icons/logo/FirstParty/VArrow-v1.png" alt="Varrow" class="member-logo" />
            <div class="member-name">
              <h3>{t('site.author.vrrw')}</h3>
              <p class="member-role">{t('social.role.contributor', 'Contributor')}</p>
            </div>
          </div>
          <div class="grid grid-small">
            {#each contributorLinks as link}
              <a class="card card-compact wrap-no-interact-all" href={link.url} target="_blank" rel="noopener noreferrer">
                <div class="icons">
                  <img src={link.platformLogo} alt={link.title} class="platform-icon" />
                </div>
                <div class="card-text">
                  <div class="card-header">
                    <h2>{link.title}</h2>
                    <span class="platform-tag">{link.handle}</span>
                  </div>
                  <p>{link.description}</p>
                </div>
              </a>
            {/each}
          </div>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .socials-page {
    /* Platform states, fixed in every scheme so "deprecated" reads the same way everywhere. */
    --state-deprecated: #ff4444;
    --state-coming-soon: #4444ff;
    min-height: 100vh;
    padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--accent);
  }

  .hero {
    margin-bottom: var(--space-8);
    text-align: center;
  }

  .hero h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--display-lg);
    text-transform: uppercase;
    letter-spacing: 0.2rem;
  }

  .hero p {
    margin: var(--space-3) 0 0;
    font-family: var(--font-ui);
    font-size: var(--text-xl);
    opacity: 0.8;
  }

  .hub-container {
    width: 100%;
    max-width: var(--layout-content);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .hub-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-5);
    width: fit-content;
    padding-bottom: var(--space-3);
    border-bottom: 2px solid var(--accent);
  }

  .main-team-header {
    margin-bottom: var(--space-5);
  }

  .section-logo {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-round);
    border: 2px solid var(--accent);
  }

  .section-title {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--text-2xl);
    letter-spacing: 0.1rem;
  }

  .team-split {
    display: flex;
    flex-direction: column;
    gap: var(--space-7);
    padding-left: var(--space-5);
    border-left: 2px solid color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .team-member-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .member-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .member-logo {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius-round);
    border: 1px solid var(--accent);
  }

  .member-name h3 {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--text-xl);
    opacity: 0.9;
  }

  .member-role {
    margin: 0;
    font-family: var(--font-ui);
    font-size: var(--text-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(28rem, 100%), 1fr));
    gap: var(--space-5);
  }

  .grid-small {
    grid-template-columns: repeat(auto-fit, minmax(min(19rem, 100%), 1fr));
  }

  .card {
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: var(--space-5);
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--accent) 5%, transparent);
    color: var(--accent);
    text-decoration: none;
    transition:
      background-color var(--duration-slow) var(--ease-in-out),
      border-color var(--duration-slow) var(--ease-in-out),
      transform var(--duration-slow) var(--ease-in-out),
      box-shadow var(--duration-slow) var(--ease-in-out);
  }

  .card:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
    transform: translateY(-0.25rem);
    box-shadow: var(--shadow-md);
  }

  .card-compact {
    padding: var(--space-4);
  }

  .card.deprecated {
    opacity: 0.6;
    filter: grayscale(0.5);
  }

  .card.coming-soon {
    cursor: default;
  }

  .icons {
    position: relative;
    flex-shrink: 0;
    margin-right: var(--space-5);
  }

  /* The platform marks are transparent SVGs, so they need a plate to read against. */
  .platform-icon {
    width: 4rem;
    height: 4rem;
    padding: var(--space-3);
    background: #fff;
    border-radius: var(--radius-md);
    object-fit: contain;
    box-shadow: var(--shadow-sm);
  }

  .card-compact .platform-icon {
    width: 3rem;
    height: 3rem;
    padding: var(--space-2);
  }

  .card-text {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
  }

  .card-text h2 {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--text-xl);
    line-height: 1;
  }

  .card-compact .card-text h2 {
    font-size: var(--text-lg);
  }

  .card-text p {
    margin: 0;
    font-family: var(--font-ui);
    font-size: var(--text-base);
    line-height: 1.4;
    opacity: 0.9;
  }

  .card-compact .card-text p {
    font-size: var(--text-sm);
  }

  .platform-tag {
    padding: var(--space-1) var(--space-2);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    border-radius: var(--radius-xs);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    text-transform: uppercase;
    white-space: nowrap;
  }

  .tag-brand {
    font-family: var(--font-display);
    letter-spacing: 0.05rem;
  }

  .status-badge {
    width: fit-content;
    margin-top: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-xs);
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    text-transform: uppercase;
  }

  .status-badge.deprecated {
    background: var(--state-deprecated);
    color: var(--text-on-accent);
  }

  .status-badge.coming-soon {
    background: var(--state-coming-soon);
    color: var(--text-on-accent);
  }

  .team-section {
    opacity: 0.9;
  }

  .team-section .main-team-header {
    border-bottom-width: 1px;
    opacity: 0.8;
  }

  .team-section .section-title {
    font-size: var(--text-xl);
  }

  @media (max-width: 900px) {
    .grid,
    .grid-small {
      grid-template-columns: 1fr;
    }

    .hero p {
      font-size: var(--text-md);
    }

    .platform-icon {
      width: 3rem;
      height: 3rem;
    }
  }

  @media (max-width: 600px) {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-1);
    }

    .team-split {
      padding-left: var(--space-4);
    }
  }
</style>
