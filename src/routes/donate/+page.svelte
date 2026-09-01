<script lang="ts">
  import { t } from '$lib/state/i18n.svelte';
  import { onMount } from 'svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Section from '$lib/components/ui/Section.svelte';

  useHoverConfig([
    {
      selectors: ['.card:not(.card-disabled)'],
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
      title: 'Patreon',
      handle: 'ELECTRIS',
      platformLogo: '/icons/logo/ThirdParty/patreon.svg',
      url: 'https://patreon.com/electris'
    }
  ]);

  const founderLinks = $derived([
    {
      title: 'Liberapay',
      handle: 'ELECTRO',
      platformLogo: '/icons/logo/ThirdParty/liberapay.svg',
      url: 'https://liberapay.com/ELECTRO/'
    },
    {
      title: 'GitHub Sponsors',
      handle: 'ItzELECTR0',
      platformLogo: '/icons/logo/ThirdParty/github.svg',
      url: 'https://github.com/sponsors/ItzELECTR0'
    },
    {
      title: 'YouTube Members',
      handle: 'ELEC7RO',
      platformLogo: '/icons/logo/ThirdParty/yt.svg',
      url: 'https://www.youtube.com/channel/UCmAjA2WP29GQ7eAKlQzKiYQ/join'
    }
  ]);
</script>

<svelte:head>
  <title>{t('nav.burger.donate')} | ELECTRIS</title>
  <meta name="description" content={t('donate.undertitle')} />
</svelte:head>

<div class="donate-page">
  <div class="hero">
    <h1 class="wrap-sentence">{t('donate.title')}</h1>
    <p>{t('donate.undertitle')}</p>
  </div>

  <div class="hub-container">
    <Section
      class="hub-section"
      title={t('donate.section.project')}
      description={t('donate.section.project.desc')}
    >
      {#snippet media()}
        <img src="/icons/logo/FirstParty/elts-v1.png" alt="ELECTRIS" class="section-logo" />
      {/snippet}
      <div class="grid">
        {#each projectLinks as link}
          <Card href={link.url} external class="wrap-no-interact-all">
            <div class="icons">
              <img src={link.platformLogo} alt={link.title} class="platform-icon" />
            </div>
            <div class="card-text">
              <div class="card-header">
                <h2>{link.title}</h2>
                <Badge class="platform-tag tag-brand">{link.handle}</Badge>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </Section>

    <Section
      class="hub-section team-section"
      title={t('donate.section.team')}
      description={t('donate.section.team.desc')}
    >
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
              <Card href={link.url} external class="card-compact wrap-no-interact-all">
                <div class="icons">
                  <img src={link.platformLogo} alt={link.title} class="platform-icon" />
                </div>
                <div class="card-text">
                  <div class="card-header">
                    <h2>{link.title}</h2>
                    <Badge class="platform-tag">{link.handle}</Badge>
                  </div>
                </div>
              </Card>
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
            <Card disabled class="card-compact wrap-no-interact-all">
              <div class="card-text">
                <p>{t('donate.vrrw.no_donations.desc')}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  </div>
</div>

<style>
  .donate-page {
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

  .donate-page :global(.hub-section) {
    gap: var(--space-6);
  }

  .donate-page :global(.section-header) {
    gap: var(--space-5);
    width: 100%;
    padding-bottom: var(--space-3);
    border-bottom: 2px solid var(--accent);
  }

  .donate-page :global(.team-section .section-header) {
    margin-bottom: var(--space-5);
    border-bottom-width: 1px;
    opacity: 0.8;
  }

  .donate-page :global(.section-copy) {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .section-logo {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-round);
    border: 2px solid var(--accent);
  }

  .donate-page :global(.section-title) {
    font-family: var(--font-body);
    font-size: var(--text-2xl);
    letter-spacing: 0.1rem;
    line-height: 1.1;
  }

  .donate-page :global(.section-description) {
    font-family: var(--font-ui);
    font-size: var(--text-md);
    line-height: 1.4;
    opacity: 0.8;
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

  .donate-page :global(.card) {
    --card-shadow: var(--shadow-md);
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: var(--space-5);
  }

  .donate-page :global(.card-compact) {
    padding: var(--space-4);
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

  :global(.card-compact) .platform-icon {
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

  :global(.card-compact) .card-text h2 {
    font-size: var(--text-lg);
  }

  .card-text p {
    margin: 0;
    font-family: var(--font-ui);
    font-size: var(--text-base);
    line-height: 1.4;
    opacity: 0.9;
  }

  :global(.card-compact) .card-text p {
    font-size: var(--text-sm);
  }

  .donate-page :global(.platform-tag) {
    font-size: var(--text-xs);
  }

  .donate-page :global(.tag-brand) {
    font-family: var(--font-display);
    letter-spacing: 0.05rem;
  }

  .donate-page :global(.team-section) {
    opacity: 0.9;
  }

  .donate-page :global(.team-section .section-title) {
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
