<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  
  const socialCards = $derived([
    {
      title: t('site.platform.yt'),
      description: t('social.vrrw.yt.desc'),
      platformLogo: '/icons/logo/ThirdParty/yt.svg',
      profilePicture: '/icons/logo/FirstParty/VArrow-v1.png',
      url: 'https://youtube.com/@V4rrow'
    },
    {
      title: t('site.platform.gh'),
      description: t('social.vrrw.gh.desc'),
      platformLogo: '/icons/logo/ThirdParty/github-nobg.svg',
      profilePicture: '/icons/logo/FirstParty/VArrow-v1.png',
      url: 'https://github.com/Varrow1'
    },
    {
      title: t('site.platform.x'),
      description: t('social.vrrw.x.desc'),
      platformLogo: '/icons/logo/ThirdParty/twitter.svg',
      profilePicture: '/icons/logo/FirstParty/VArrow-v1.png',
      url: 'https://x.com/0xVarrow'
    }
  ]);
</script>

<svelte:head>
  <title>Socials | VARROW</title>
</svelte:head>
  
  <div class="socials-page">
    <div class="hero">
      <h1>{t('site.author.vrrw', 'Varrow', 'en-US')}</h1>
      <p>{t('site.author.vrrw.slogan')}</p>
    </div>
  
    <div class="hero">
      {#each socialCards as card}
        <a class="card" href={card.url} target="_blank">
          <div class="icons">
            <img src={card.platformLogo} alt={card.title} class="platform-logo"/>
            <img src={card.profilePicture} alt="Varrow" class="profile-picture"/>
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
      font-family: Aileron;
    }
  
    .card {
      display: flex;
      align-items: center;
      padding: 15px;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      text-decoration: none;
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

    @media (max-width: 900px), (any-pointer: coarse) {
      .socials-page {
        padding: 6.5rem 1rem 2rem;
      }

      .hero {
        margin-bottom: 2rem;
        gap: 1rem;
      }

      .hero h1 {
        font-size: clamp(2.4rem, 9vw, 3.4rem);
      }

      .hero p {
        font-size: 1.15rem;
        max-width: 32rem;
      }

      .card {
        max-width: 42rem;
        padding: 1rem;
        border-radius: 1rem;
      }

      .platform-logo {
        width: 3rem;
        height: 3rem;
      }

      .profile-picture {
        width: 2.25rem;
        height: 2.25rem;
        right: -0.35rem;
        bottom: -0.35rem;
      }

      .card-text h2 {
        font-size: 1.5rem;
      }

      .card-text p {
        font-size: 1rem;
        line-height: 1.4;
      }
    }

    @media (max-width: 640px) {
      .card {
        align-items: flex-start;
      }

      .icons {
        margin-right: 0.85rem;
      }
    }
  </style>
