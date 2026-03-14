<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n';
  import { useHoverConfig, type HoverConfig } from '$lib/stores/hoverConfig';
  import gsap from 'gsap';

  let currentVideo: HTMLVideoElement;
  let nextVideo: HTMLVideoElement;
  let recentlyPlayed: number[] = []; // Track recently played clips to enforce cooldown
  let hasMetShadow = false; // Track if the rare encounter (6.mp4) has been played

  $: pages = [
    {
      title: $t('proj.twaos.st', 'Wishlist on Steam'),
      description: $t('proj.twaos.st.desc', 'The largest game distribution platform.'),
      icon: '/icons/Logos/ThirdParty/steam.svg',
      href: 'https://store.steampowered.com/app/2231750/The_Wonderful_Adventures_Of_Sip/'
    }
  ];

  const hoverConfigs: HoverConfig[] = [
    {
      selectors: ['.sip-icon'],
      className: 'hovered-sip',
      requireAllSelectors: false,
      lockPosition: true,
      customPositioning: {
       targetSelector: '.styled-sip'
      }
    },
    {
      type: [ 'img' ],
      selectors: ['.gallery-image'],
      className: 'hovered-gallery-image',
      lockPosition: true
    },
    {
      selectors: ['.hero-text'],
      className: 'hovered-button-grow'
    }
  ];

  useHoverConfig(hoverConfigs);

  function getNextClip(currentClip: number): number {
    const availableClips = [2, 3, 4, 5, 7];
    
    // If 7.mp4 just played, 8.mp4 must play next
    if (currentClip === 7) {
      return 8;
    }
    
    const eligibleClips = availableClips.filter(clip => !recentlyPlayed.includes(clip));
    
    // Filter out similar clips if the current clip is similar
    let filteredClips = [...eligibleClips];
    if (currentClip === 2 || currentClip === 4) {
      filteredClips = filteredClips.filter(clip => clip !== 2 && clip !== 4);
    }
    if (currentClip === 3 || currentClip === 5) {
      filteredClips = filteredClips.filter(clip => clip !== 3 && clip !== 5);
    }
    
    if (!hasMetShadow && Math.random() < 0.001) // 0.1% chance to meet the shadow
    {
      hasMetShadow = true;
      return 6;
    }
    
    if (filteredClips.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredClips.length);
      return filteredClips[randomIndex];
    }
    
    if (eligibleClips.length > 0) {
      const randomIndex = Math.floor(Math.random() * eligibleClips.length);
      return eligibleClips[randomIndex];
    }
    
    return Math.floor(Math.random() * 5) + 2;
  }

  function updateRecentlyPlayed(clipNumber: number) {
    recentlyPlayed.push(clipNumber);
    if (recentlyPlayed.length > 3) {
      recentlyPlayed.shift();
    }
  }

  function playNextVideo() {
    const currentClipNumber = parseInt(currentVideo.src.split('/').pop()?.split('.')[0] || '1');
    updateRecentlyPlayed(currentClipNumber);
    
    const nextClipNumber = getNextClip(currentClipNumber);
    nextVideo.src = `/media/TWAOS/BG/${nextClipNumber}.mp4`;
    
    nextVideo.load();
    nextVideo.onloadeddata = () => {
      swapVideos();
    };
  }

  function swapVideos() {
    const temp = currentVideo;
    currentVideo = nextVideo;
    nextVideo = temp;
    
    currentVideo.style.opacity = "1";
    nextVideo.style.opacity = "0";
    
    const playPromise = currentVideo.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Video playback error:", error);
        setTimeout(() => {
          currentVideo.play().catch(e => console.error("Retry failed:", e));
        }, 1000);
      });
    }
  }

  function handleVideoEnded() {
    playNextVideo();
  }

  function angle(cx: number, cy: number, ex: number, ey: number): number {
    const dy: number = ey - cy;
    const dx: number = ex - cx;
    const rad: number = Math.atan2(dy, dx);
    const deg: number = rad * 180 / Math.PI;
    return deg;
  }

  onMount(() => {
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };

    setTimeout(cursorReset, 10);

    const track = document.getElementById('image-track') as HTMLElement;
    
    gsap.set(track, {
      xPercent: -122,
      yPercent: -80
    });
    
    const initialTrackPos = -122;
    const trackRange = -185 - (-95);
    const normalizedPos = (initialTrackPos - (-95)) / trackRange;
    const initialImageScroll = 35 + (normalizedPos * (65 - 35));
    
    gsap.set(track.getElementsByClassName("gallery-image"), {
      objectPosition: `${initialImageScroll}% center`
    });
    
    window.onmousedown = e => {
      track.dataset.mouseDownAt = e.clientX.toString();
    }

    window.onmouseup = () => {
      track.dataset.mouseDownAt = "0";
      track.dataset.prevPercentage = track.dataset.percentage || "-122";
    }

    window.onmousemove = e => {
      if(track.dataset.mouseDownAt === "0") return;
        
      const mouseDelta: number = parseFloat(track.dataset.mouseDownAt || "0") - e.clientX,
            maxDelta: number = window.innerWidth / 2;
        
      const percentage: number = (mouseDelta / maxDelta) * -100,
            nextPercentageUnconstrained: number = parseFloat(track.dataset.prevPercentage || "-122") + percentage,
            nextPercentage: number = Math.max(Math.min(nextPercentageUnconstrained, -95), -185);
        
      track.dataset.percentage = nextPercentage.toString();
      
      gsap.to(track, {
        xPercent: nextPercentage,
        yPercent: -80,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto"
      });
      
      const trackRange = -185 - (-95); // = -90
      const normalizedPosition = (nextPercentage - (-95)) / trackRange; // 0 to 1
      const imageScrollRange = 65 - 35; // = 30
      const imageScroll = 35 + (normalizedPosition * imageScrollRange); // 35 to 65
        
      gsap.to(track.getElementsByClassName("gallery-image"), {
        objectPosition: `${imageScroll}% center`,
        duration: 1,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    currentVideo.src = '/media/TWAOS/BG/1.mp4';
    currentVideo.load();
    
    currentVideo.addEventListener('ended', handleVideoEnded);
    nextVideo.addEventListener('ended', handleVideoEnded);
    
    currentVideo.addEventListener('loadeddata', () => {
      currentVideo.play().catch(error => {
        console.warn("Autoplay prevented, waiting for user interaction:", error);
        
        const playOnInteraction = () => {
          currentVideo.play().catch(e => console.error("Manual play failed:", e));
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('keydown', playOnInteraction, { once: true });
      });
    }, { once: true });
    
    const checkCanvasVisibility = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const isCanvas1Visible = scrollY < window.innerHeight * 0.9;
      
      if (isCanvas1Visible && currentVideo.paused && !document.hidden) {
        currentVideo.play().catch(e => console.error("Resume play failed:", e));
      } else if (!isCanvas1Visible && !currentVideo.paused) {
        currentVideo.pause();
      }
    };
    
    window.addEventListener('scroll', checkCanvasVisibility, { passive: true });
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        currentVideo.pause();
      } else {
        checkCanvasVisibility();
      }
    });
    
    const anchor = document.querySelector('.styled-sip') as HTMLElement;
    const eyes = document.querySelectorAll('.eye') as NodeListOf<HTMLElement>;
    if (anchor) {
      const rekt = anchor.getBoundingClientRect();
      const anchorX = rekt.left + rekt.width / 1.5;
      const anchorY = rekt.top + rekt.height / 3;

      document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const angleDeg = angle(mouseX, mouseY, anchorX, anchorY);

        eyes.forEach((eye) => {
          eye.style.transform = `rotate(${90 + angleDeg}deg)`;
        });
      });
    }
    
    return () => {
      window.removeEventListener('scroll', checkCanvasVisibility);
      currentVideo.removeEventListener('ended', handleVideoEnded);
      nextVideo.removeEventListener('ended', handleVideoEnded);
    };
  });
</script>

<svelte:head>
  <title>TWAOS | ELECTRIS</title>
</svelte:head>

<div class="twaos-page">
  <div class="canvas canvas-1">
    <div class="hero">
      <div class="video-container">
        <video bind:this={currentVideo} class="hero-video" muted playsinline autoplay></video>
        <video bind:this={nextVideo} class="hero-video next" muted playsinline autoplay style="opacity:0;"></video>
        <div class="video-overlay"></div>
      </div>
      <div class="hero-text">
        <div class="wrap-no-interact-all twaos-title">
          <span class="text-container"><h2 class="tw">{$t('proj.twaos.title.tw', 'The Wonderful')}</h2></span>
          <span class="text-container"><h3 class="ao">{$t('proj.twaos.title.ao', 'Adventures Of')}</h3></span>
          <span class="text-container"><h1 class="sip">{$t('proj.twaos.title.sip', 'SIP')}</h1></span>
        </div>
        <span class="text-container"><h5>{$t('proj.twaos.desc.short', 'An open-source Indie Game created by a Solo Developer')}</h5></span>
      </div>
      <div class="wrap-no-interact-all cards-wrapper">
        {#each pages as page}
          <div class="card-container">
            <a class="card" href={page.href} target="_blank">
              <div class="card-icon">
                <img src={page.icon} alt="{page.title} - icon" style="width: 8vh; object-fit: contain;"/>
              </div>
              <div class="card-content">
                <h2>{page.title}</h2>
                <p>{page.description}</p>
              </div>
            </a>
          </div>
        {/each}
      </div>
      <div class="sip-icon">
        <a href="https://github.com/ItzELECTR0/TWAOS" target="_blank" class="styled-sip-link">
          <img class="styled-sip" src="/media/TWAOS/Styled/Sip.svg" alt="SIP" />
        </a>
        <div class="eyes">
          <a href="https://github.com/ItzELECTR0/TWAOS" target="_blank" class="styled-sip-link">
            <img class="eye" src="/media/TWAOS/Styled/SipEye.png" alt="SIPEYE-LEFT" style="top: 82vh; left: 24vh;" />
            <img class="eye" src="/media/TWAOS/Styled/SipEye.png" alt="SIPEYE-RIGHT" style="top: 80vh; left: 32.8vh;" />
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="canvas canvas-2">
    <div id="image-track" data-mouse-down-at="0" data-prev-percentage="-122" data-percentage="-122">
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 1" draggable="false"/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 2" draggable="false"/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 3" draggable="false"/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 4" draggable="false"/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 5" draggable="false"/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 6" draggable="false"/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 7" draggable="false"/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 8" draggable="false"/>
    </div>
  </div>
</div>

<style>
  .twaos-page {
    position: relative;
    height: 200vh;
  }

  .canvas {
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }

  .canvas-1 {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .canvas-2 {
    position: relative;
    z-index: 10;
    background-color: var(--bg-body);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 -2vh 5vh rgba(0, 0, 0, 0.5);
  }

  #image-track {
    display: flex;
    gap: 4vmin;
    position: absolute;
    left: 50%;
    top: 50%;
  }

  #image-track > .gallery-image {
    width: 30vmin;
    height: 42vmin;
    object-fit: cover;
    object-position: 50% center;
    user-select: none;
    flex-shrink: 0;
  }

  .text-container {
    display: inline-block;
    line-height: 1.5;
  }

  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 6vh;
    text-align: center;
    overflow: hidden;
  }

  .twaos-title,
  .hero-text {
    position: relative;
    z-index: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .hero-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -2;
    transition: opacity 0.1s ease-in-out;
  }

  .hero h1 {
    display: inline-block;
    font-family: 'Nightcore';
    font-size: 8rem;
    margin: 0;
  }

  .hero h1.sip {
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 10px;
    margin: -1.7vh;
    color: #ff9933;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 0 1vh rgba(255, 123, 0, 0.7));
  }

  .hero h2 {
    font-family: 'Nightcore';
    font-size: 4rem;
    margin: -0.8vh;
  }

  .hero h2.tw {
    font-family: 'Nightcore';
    font-size: 4rem;
    margin: -0.8vh;
    color: #f65901;
    text-shadow: 0 0 10px rgba(246, 89, 1, 0.3), 0 0 20px rgba(246, 89, 1, 0.2), 0 0 30px rgba(246, 89, 1, 0.05);
  }

  .hero h3 {
    font-family: 'Nightcore';
    font-size: 3.5rem;
    margin: -0.5vh;
  }

  .hero h3.ao {
    font-family: 'Nightcore';
    font-size: 3.5rem;
    margin: -0.5vh;
    color: #f65901;
    text-shadow: 0 0 10px rgba(246, 89, 1, 0.3), 0 0 20px rgba(246, 89, 1, 0.2), 0 0 30px rgba(246, 89, 1, 0.05);
  }

  .hero h5 {
    font-family: 'Redwing';
    font-weight: 500;
    font-size: 1.5rem;
    margin: 2vh;
  }

  .video-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -2;
  }

  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  .styled-sip {
    position: absolute;
    top: 70vh;
    bottom: 2vh;
    left: 2vh;
    right: 2vh;
    width: 40vh;
    height: 40vh;
  }

  .eye {
    position: absolute;
    bottom: 2vh;
    right: 2vh;
    width: 3vh;
    height: 3vh;
  }

  .sip-icon {
    display: grid;
    place-items: center;
  }

  .cards-wrapper {
    position: absolute;
    bottom: 5vh;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    gap: 2vw;
    z-index: 2;
  }

  .card-container {
    gap: 1vh;
  }

  .card {
    font-family: 'sans-serif';
    display: flex;
    flex-direction: line;
    align-items: left;
    padding: 1vh;
    border-radius: 1.8vh;
    text-decoration: none;
    color: #f65901;
    width: 35vh;
    transition: transform 0.2s, background-color 0.2s ease;
    justify-content: left;
    text-align: left;
    gap: 1vh;
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
    font-family: 'Nightcore';
    font-size: 2rem;
    color: #01f619;
  }

  .card-content p {
    font-family: 'Redwing';
    font-weight: 300;
    font-size: 1.2rem;
    margin: 5px 0 0;
    color: #01f619;
  }
</style>