<script lang="ts">
  import { t } from '$lib/state/i18n.svelte';
  import { onMount } from 'svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';

  let projects = $derived([
    {
      title: t('proj.twaos.title.short'),
      font: 'Nightcore',
      description: t('proj.twaos.desc.long'),
      icon: '/media/TWAOS/Logo/twaos.svg',
      width: 4.4,
      link: '/projects/games/TWAOS'
    },
    {
      title: t('site.newhome.title'),
      font: 'Tourner',
      description: t('site.newhome.slogan'),
      icon: '/icons/logo/FirstParty/newhome-v1.svg',
      width: 4.4,
      link: '/newhome'
    }
  ]);

  useHoverConfig([
    {
      selectors: ['.card'],
      className: 'hovered-project-card',
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
</script>

<svelte:head>
  <title>Projects | ELECTRIS</title>
</svelte:head>

<div class="hero">
  <h1>{t('proj.title')}</h1>
</div>

<div class="cards">
  {#each projects as project}
    <a class="card wrap-no-interact-all" href={project.link}>
      <div class="card-content" style="font-family: {project.font};">
        <div class="card-header">
          <div class="card-icon">
            <img
              src={project.icon}
              alt="{project.title} icon"
              style="--project-icon-width: {project.width}rem;"
            />
          </div>
          <h2>{project.title}</h2>
        </div>
        <p>{project.description}</p>
      </div>
    </a>
  {/each}
</div>

<style>
  .hero {
    font-family: var(--font-ui);
    text-align: center;
    padding-top: var(--layout-page-top);
    margin-bottom: var(--space-7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .hero h1 {
    padding-top: var(--space-3);
    font-family: var(--font-display);
    font-size: 4rem;
    margin: 0;
  }

  .cards {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
    padding: 0 var(--space-5) var(--space-5);
    justify-content: center;
    align-items: center;
  }

  .card {
    font-family: var(--font-ui);
    display: flex;
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    text-decoration: none;
    color: var(--text-primary);
    width: 100%;
    max-width: var(--layout-measure);
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out);
    justify-content: left;
    text-align: left;
  }
  
  .card:hover {
    transform: scale(1.02);
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: var(--space-1);
  }

  .card-icon img {
    width: var(--project-icon-width);
    object-fit: contain;
    margin-inline: var(--space-2) var(--space-1);
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .card-content h2 {
    margin: 0;
    font-size: var(--text-2xl);
  }
  
  .card-content p {
    font-family: var(--font-body);
    font-weight: 300;
    font-size: var(--text-md);
    margin: var(--space-1) 0 0;
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .hero {
      padding-top: calc(var(--layout-page-top) + var(--space-4));
      margin-bottom: var(--space-6);
      padding-inline: var(--space-4);
    }

    .hero h1 {
      font-size: clamp(2.8rem, 11vw, 4rem);
    }

    .cards {
      gap: var(--space-4);
      padding: 0 var(--space-4) var(--space-6);
    }

    .card {
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      gap: var(--space-3);
    }

    .card-icon img {
      width: clamp(3rem, 12vw, 4.5rem);
      margin-inline: 0;
    }

    .card-content h2 {
      font-size: var(--text-xl);
    }

    .card-content p {
      font-size: var(--text-md);
      line-height: 1.5;
    }
  }

  @media (max-width: 640px) {
    .card-content h2 {
      font-size: var(--text-xl);
    }

    .card-header {
      gap: var(--space-2);
    }
  }
</style>
