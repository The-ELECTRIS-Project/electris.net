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
      status: 'coming-soon' as const
    },
    {
      title: t('site.platform.ds'),
      handle: t('social.server.name'),
      description: t('social.discord.desc'),
      platformLogo: '/icons/logo/ThirdParty/discord.svg',
      url: 'https://discord.gg/TgtCGKxbZr',
      status: 'deprecated' as const
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

  const people = $derived([
    {
      name: t('site.author.eltr'),
      role: t('social.role.founder', 'Founder'),
      logo: '/icons/logo/FirstParty/eltr-v10.png',
      links: founderLinks
    },
    {
      name: t('site.author.vrrw'),
      role: t('social.role.contributor', 'Contributor'),
      logo: '/icons/logo/FirstParty/VArrow-v1.png',
      links: contributorLinks
    }
  ]);
</script>

<svelte:head>
  <title>Socials | ELECTRIS</title>
</svelte:head>

<PageShell width="wide" title={t('social.title')} lead={t('social.undertitle')}>
  <Section title={t('social.section.project')}>
    {#snippet media()}
      <img src="/icons/logo/FirstParty/elts-v1.png" alt="ELECTRIS" class="section-logo" />
    {/snippet}

    <div class="grid">
      {#each projectLinks as link}
        <LinkCard
          title={link.title}
          handle={link.handle}
          description={link.description}
          icon={link.platformLogo}
          href={link.url}
          status={link.status}
        />
      {/each}
    </div>
  </Section>

  <Section title={t('social.section.team')}>
    <div class="team-split">
      {#each people as person}
        <PersonLinks
          name={person.name}
          role={person.role}
          logo={person.logo}
          links={person.links}
        />
      {/each}
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
