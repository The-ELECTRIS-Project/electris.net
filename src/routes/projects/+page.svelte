<script lang="ts">
  import { t } from '$lib/stores/i18n';
  import { onMount } from 'svelte';

  let iconSize = 150;

  $: projects = [
    {
      title: $t('proj.twaos.title.short', 'TWAOS'),
      font: $t('Nightcore'),
      description: $t('proj.twaos.desc.long', 'An adventure-action-rpg with a sci-fi setting and a fantasy inspired super-powered, heart wrenching narrative.'),
      icon: '/media/TWAOS/Logo/twaos.svg',
      width: 8,
      link: '/egs/twaos'
    },
    {
      title: $t('site.newhome.version', 'NewHome'),
      font: $t('Letric'),
      description: $t('site.newhome.slogan', 'A New Home for your browser'),
      icon: '/icons/Logos/FirstParty/newhome.svg',
      width: 8,
      link: '/newhome'
    }
  ];

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
  <h1>{$t('proj.title', 'Projects')}</h1>
</div>

<div class="cards">
  {#each projects as project}
    <a class="card" href={project.link}>
      <div class="card-icon" style="margin-right: {Math.min(iconSize * 0.02, 0.44)}vh;">
        <img
          src={project.icon}
          alt="{project.title} icon"
          style="width: {project.width}vh; object-fit: contain; margin-right: {Math.min(iconSize * 0.5, 10)}px; margin-left: {Math.min(iconSize * 0.5, 5)}px;"
        />
      </div>
      <div class="card-content" style="font-family: {project.font};">
        <h2>{project.title}</h2>
        <p>{project.description}</p>
      </div>
    </a>
  {/each}
</div>

<style>
  .hero {
    font-family: 'sans-serif';
    text-align: center;
    padding-top: 80px;
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .hero h1 {
    padding-top: 1vh;
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
    font-family: 'sans-serif';
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
</style>
