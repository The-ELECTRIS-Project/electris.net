<script lang="ts">
  import { t } from '$lib/state/i18n.svelte';
  import { onMount } from 'svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import PageShell from '$lib/components/ui/PageShell.svelte';
  import Section from '$lib/components/ui/Section.svelte';
  import LinkCard from '$lib/components/ui/LinkCard.svelte';
  import PersonLinks from '$lib/components/ui/PersonLinks.svelte';

  useHoverConfig([
    {
      selectors: ['.link-card'],
      className: 'hovered-social-card',
      lockPosition: true
    },
    {
      type: ['h2'],
      selectors: ['.section h2'],
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

<PageShell width="wide" title={t('donate.title')} lead={t('donate.undertitle')}>
  <Section title={t('donate.section.project')} description={t('donate.section.project.desc')}>
    {#snippet media()}
      <img src="/icons/logo/FirstParty/elts-v1.png" alt="ELECTRIS" class="section-logo" />
    {/snippet}

    <div class="grid">
      {#each projectLinks as link}
        <LinkCard
          title={link.title}
          handle={link.handle}
          icon={link.platformLogo}
          href={link.url}
        />
      {/each}
    </div>
  </Section>

  <Section title={t('donate.section.team')} description={t('donate.section.team.desc')}>
    <div class="team-split">
      <PersonLinks
        name={t('site.author.eltr')}
        role={t('social.role.founder', 'Founder')}
        logo="/icons/logo/FirstParty/eltr-v10.png"
        links={founderLinks}
      />
      <PersonLinks
        name={t('site.author.vrrw')}
        role={t('social.role.contributor', 'Contributor')}
        logo="/icons/logo/FirstParty/VArrow-v1.png"
        emptyMessage={t('donate.vrrw.no_donations.desc')}
      />
    </div>
  </Section>
</PageShell>

<style>
  .section-logo {
    width: 3rem;
    height: 3rem;
    object-fit: contain;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: var(--space-4);
  }


  .team-split {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: var(--space-7);
  }

</style>
