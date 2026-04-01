<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  import { onMount } from 'svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';

  let iconSize = 150;

  let projects = $derived([
    {
      title: t('proj.twaos.title.short'),
      font: 'Nightcore',
      description: t('proj.twaos.desc.long'),
      icon: '/media/TWAOS/Logo/twaos.svg',
      width: 8,
      link: '/egs/twaos'
    },
    {
      title: t('site.newhome.title'),
      font: 'Letric',
      description: t('site.newhome.slogan'),
      icon: '/icons/logo/FirstParty/newhome-v1.svg',
      width: 8,
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
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };

    setTimeout(cursorReset, 10);
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
          <div class="card-icon" style="margin-right: {Math.min(iconSize * 0.02, 0.44)}vmin;">
            <img
              src={project.icon}
              alt="{project.title} icon"
              style="width: {project.width}vmin; object-fit: contain; margin-right: {Math.min(iconSize * 0.5, 10)}px; margin-left: {Math.min(iconSize * 0.5, 5)}px;"
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
    font-family: 'Aileron';
    text-align: center;
    padding-top: 80px;
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .hero h1 {
    padding-top: 1vmin;
    font-family: 'Letric';
    font-size: 4rem;
    margin: 0;
  }

  .cards {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 0 20px 20px;
    justify-content: center;
    align-items: center;
  }

  .card {
    font-family: 'Aileron';
    display: flex;
    flex-direction: line;
    align-items: left;
    padding: 10px;
    border-radius: 8px;
    text-decoration: none;
    color: #f65901;
    width: 100%;
    max-width: 600px;
    transition: transform 0.2s, background-color 0.2s ease;
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
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .card-content h2 {
    margin: 0;
    font-size: 2rem;
  }
  
  .card-content p {
    font-family: 'Redwing';
    font-weight: 300;
    font-size: 1.2rem;
    margin: 5px 0 0;
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .hero {
      padding-top: 6.5rem;
      margin-bottom: 2rem;
      padding-inline: 1rem;
    }

    .hero h1 {
      font-size: clamp(2.8rem, 11vw, 4rem);
    }

    .cards {
      gap: 1rem;
      padding: 0 1rem 2rem;
    }

    .card {
      max-width: 42rem;
      padding: 1rem 1.1rem;
      border-radius: 1rem;
      gap: 0.9rem;
    }

    .card-icon img {
      width: clamp(3rem, 12vw, 4.5rem) !important;
      margin-right: 0 !important;
      margin-left: 0 !important;
    }

    .card-content h2 {
      font-size: 1.8rem;
    }

    .card-content p {
      font-size: 1.15rem;
      line-height: 1.5;
    }
  }

  @media (max-width: 640px) {
    .card-content h2 {
      font-size: 1.6rem;
    }

    .card-header {
      gap: 0.7rem;
    }
  }
</style>
