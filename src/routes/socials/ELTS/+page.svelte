<script>
    import { t } from "$lib/stores/i18n.svelte";

    const socialCards = $derived([
      {
        title: t('site.platform.yt'),
        description: t('site.slogan'),
        platformLogo: '/icons/Logos/ThirdParty/yt.svg',
        profilePicture: '/icons/Logos/FirstParty/elts-v1.png',
        url: 'https://youtube.com/@ELECTRIS'
      },
      {
        title: t('site.platform.ds'),
        description: t('social.elts.ds.desc', 'Legends of Lightning', 'en-US'),
        platformLogo: '/icons/Logos/ThirdParty/discord.svg',
        profilePicture: '/icons/Logos/FirstParty/elts-v1.png',
        url: 'https://discord.gg/TgtCGKxbZr'
      }
    ]);
  </script>

<svelte:head>
  <title>Socials | ELECTRIS</title>
</svelte:head>
  
  <div class="socials-page">
    <div class="hero">
      <h1>{t('site.author.elts', 'ELECTRIS', 'en-US')}</h1>
      <p>{t('social.undertitle')}</p>
    </div>
  
    <div class="hero">
      {#each socialCards as card}
        <a class="card" href={card.url} target="_blank">
          <div class="icons">
            <img src={card.platformLogo} alt={card.title} class="platform-logo"/>
            <img src={card.profilePicture} alt="ELECTRIS" class="profile-picture"/>
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
  
    .platform-logo {
      width: 4vmin;
      height: 4vmin;
      image-resolution: 80px;
      border-radius: 50%;
      background-color: #fff;
    }
  
    .profile-picture {
      width: 3vmin;
      height: 3vmin;
      border-radius: 50%;
      position: absolute;
      right: -10px;
      bottom: -10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
    }
  
    .card-text h2 {
      margin: 0;
      font-size: 1.8rem;
      text-align: left;
    }
  
    .card-text p {
      margin: 5px 0 0;
      font-size: 1rem;
      text-align: left;
    }
  </style>