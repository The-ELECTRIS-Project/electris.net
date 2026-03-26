<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };

    setTimeout(cursorReset, 10);
  });

  let socialCards = $derived([
    {
      title: t('site.title', 'ELECTRIS', 'en-US'),
      description: t('site.slogan'),
      profilePicture: '/icons/Logos/FirstParty/elts-v1.png',
      url: '/socials/ELTS'
    },
    {
      title: t('site.author.eltr', 'ELECTRO', 'en-US'),
      description: t('site.author.eltr.slogan'),
      profilePicture: '/icons/Logos/FirstParty/eltr-v10.png',
      url: '/socials/ELTR'
    },
    {
      title: t('site.author.vrrw', 'Varrow', 'en-US'),
      description: t('site.author.vrrw.slogan'),
      profilePicture: '/icons/Logos/FirstParty/VArrow.png',
      url: '/socials/VRRW'
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
  
    <div class="hero">
      {#each socialCards as card}
        <a class="card" href={card.url} target="_self">
          <div class="icons">
            <img src={card.profilePicture} alt="Person Logo" class="profile-picture" />
          </div>
          <div class="card-text">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </div>
        </a>
      {/each}
    </div>
  </div>
  
  <style>
    .socials-page {
      padding: 80px 20px 20px;
      color: #f65901;
      min-height: 100vh;
    }
  
    .hero {
      min-height: calc(20vmin - 25vmin);
      margin-bottom: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 20px;
    }
    
    .hero h1 {
      padding-top: 1vmin;
      font-family: 'Letric';
      font-size: 3rem;
      margin: 0;
    }
  
    .hero p {
      font-size: 1.5rem;
      margin: 10px 0 0;
      font-family: sans-serif;
    }
  
    .card {
      display: flex;
      align-items: center;
      padding: 15px;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      text-decoration: none;
      color: #f65901;
      transition: transform 0.2s ease;
    }
  
    .card:hover {
      transform: scale(1.02);
    }
  
    .icons {
      position: relative;
      margin-right: 15px;
      flex-shrink: 0;
    }
  
    .profile-picture {
      width: 4vmin;
      height: 4vmin;
      image-resolution: 80px;
      border-radius: 50%;
      background-color: #fff;
    }
  
    .card-text h2 {
      margin: 0;
      font-family: 'Letric';
      font-size: 1.8rem;
      text-align: left;
    }
  
    .card-text p {
      margin: 0 0 0;
      font-family: 'Redwing';
      font-weight: 500;
      font-size: 1.2rem;
      text-align: left;
    }
  </style>