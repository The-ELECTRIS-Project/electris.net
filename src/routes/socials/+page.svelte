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
        orbit.className = "circle";
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
      description: t('social.eltr.yt.desc'),
      platformLogo: '/icons/logo/ThirdParty/yt.svg',
      url: 'https://youtube.com/@ELEC7RO'
    },
    {
      title: t('site.platform.gh'),
      handle: 'ItzELECTR0',
      description: t('social.eltr.gh.desc'),
      platformLogo: '/icons/logo/ThirdParty/github-nobg.svg',
      url: 'https://github.com/ItzELECTR0'
    }
  ]);

  const cofounderLinks = $derived([
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
      platformLogo: '/icons/logo/ThirdParty/github-nobg.svg',
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
    <h1>{t('social.title')}</h1>
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
          <a class="card wrap-no-interact-all {link.status || ''}" href={link.url} target={link.url === '#' ? '_self' : '_blank'} rel="noopener noreferrer">
            <div class="icons">
              <img src={link.platformLogo} alt={link.title} class="platform-icon" />
            </div>
            <div class="card-text">
              <div class="card-header">
                <h2 class="font-redwing">{link.title}</h2>
                <span class="platform-tag {link.handle === 'ELECTRIS' ? 'tag-letric' : ''}">{link.handle}</span>
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
            <h3>{t('site.author.eltr')}</h3>
          </div>
          <div class="grid grid-small">
            {#each founderLinks as link}
              <a class="card card-compact wrap-no-interact-all" href={link.url} target="_blank" rel="noopener noreferrer">
                <div class="icons">
                  <img src={link.platformLogo} alt={link.title} class="platform-icon" />
                </div>
                <div class="card-text">
                  <div class="card-header">
                    <h2 class="font-redwing">{link.title}</h2>
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
            <h3>{t('site.author.vrrw')}</h3>
          </div>
          <div class="grid grid-small">
            {#each cofounderLinks as link}
              <a class="card card-compact wrap-no-interact-all" href={link.url} target="_blank" rel="noopener noreferrer">
                <div class="icons">
                  <img src={link.platformLogo} alt={link.title} class="platform-icon" />
                </div>
                <div class="card-text">
                  <div class="card-header">
                    <h2 class="font-redwing">{link.title}</h2>
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
    padding: 80px 20px 60px;
    color: #f65901;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero {
    margin-bottom: 60px;
    text-align: center;
  }
  
  .hero h1 {
    font-family: 'Letric';
    font-size: clamp(3rem, 8vw, 5rem);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.2rem;
  }

  .hero p {
    font-size: 1.5rem;
    margin: 10px 0 0;
    font-family: Aileron;
    opacity: 0.8;
  }

  .hub-container {
    width: 100%;
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    gap: 80px;
  }

  .hub-section {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 20px;
    border-bottom: 2px solid #f65901;
    padding-bottom: 10px;
    width: fit-content;
  }

  .main-team-header {
    margin-bottom: 20px;
  }

  .section-logo {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #f65901;
  }

  .section-title {
    font-family: 'Redwing';
    font-size: 1.8rem;
    margin: 0;
    letter-spacing: 0.1rem;
  }

  .team-split {
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding-left: 20px;
    border-left: 2px solid rgba(246, 89, 1, 0.2);
  }

  .team-member-group {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .member-header {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .member-logo {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #f65901;
  }

  .member-header h3 {
    font-family: 'Redwing';
    font-size: 1.4rem;
    margin: 0;
    opacity: 0.9;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 20px;
  }

  .grid-small {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: rgba(246, 89, 1, 0.05);
    border: 1px solid rgba(246, 89, 1, 0.2);
    border-radius: 12px;
    text-decoration: none;
    color: #f65901;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .card:hover {
    background: rgba(246, 89, 1, 0.1);
    border-color: rgba(246, 89, 1, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  .card-compact {
    padding: 15px;
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
    margin-right: 20px;
    flex-shrink: 0;
  }

  .platform-icon {
    width: 64px;
    height: 64px;
    background: #fff;
    border-radius: 12px;
    padding: 10px;
    object-fit: contain;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  .card-compact .platform-icon {
    width: 48px;
    height: 48px;
    padding: 8px;
  }

  .card-text {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .card-text h2 {
    margin: 0;
    font-size: 1.6rem;
    line-height: 1;
  }

  .card-compact .card-text h2 {
    font-size: 1.3rem;
  }

  .font-redwing {
    font-family: 'Redwing';
  }

  .platform-tag {
    font-family: 'Redwing';
    font-size: 0.8rem;
    padding: 2px 8px;
    background: rgba(246, 89, 1, 0.2);
    border-radius: 4px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .tag-letric {
    font-family: 'Letric';
    letter-spacing: 0.05rem;
  }

  .card-text p {
    margin: 0;
    font-family: 'Aileron';
    font-size: 1rem;
    line-height: 1.4;
    opacity: 0.9;
  }

  .card-compact .card-text p {
    font-size: 0.9rem;
  }

  .status-badge {
    font-family: 'Redwing';
    font-size: 0.75rem;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    width: fit-content;
    margin-top: 4px;
  }

  .status-badge.deprecated {
    background: #ff4444;
    color: #fff;
  }

  .status-badge.coming-soon {
    background: #4444ff;
    color: #fff;
  }

  .team-section {
    opacity: 0.9;
  }

  .team-section .main-team-header {
    border-bottom-width: 1px;
    opacity: 0.8;
  }

  .team-section .section-title {
    font-size: 1.4rem;
  }

  @media (max-width: 900px) {
    .socials-page {
      padding: 100px 15px 40px;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .grid-small {
      grid-template-columns: 1fr;
    }

    .hero h1 {
      font-size: 3.5rem;
    }

    .hero p {
      font-size: 1.2rem;
    }

    .platform-icon {
      width: 50px;
      height: 50px;
    }
  }

  @media (max-width: 600px) {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }

    .team-split {
      padding-left: 15px;
    }
  }
</style>
