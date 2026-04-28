<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n.svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';
  import gsap from 'gsap';

  let currentVideo: HTMLVideoElement;
  let nextVideo: HTMLVideoElement;
  let recentlyPlayed: number[] = []; // Track recently played clips to enforce cooldown
  let hasMetShadow = false; // Track if the rare encounter (6.mp4) has been played

  let mouseDownAt = $state(0);
  let prevOffset = $state(0);
  let offset = $state(0);

  let pages = $derived([
    {
      title: t('proj.twaos.st'),
      description: t('proj.twaos.st.desc'),
      icon: '/icons/logo/ThirdParty/steam.svg',
      href: 'https://store.steampowered.com/app/2231750/The_Wonderful_Adventures_Of_Sip/'
    }
  ]);

  useHoverConfig([
    {
      selectors: ['.sip-icon'],
      className: 'hovered-styled-sip',
      lockPosition: true,
      color: 'var(--circle-hover-sip)',
      customPositioning: {
       targetSelector: '.styled-sip'
      },
      dynamicSizeOffset: -3,
      positionOffset: { x: -1.4, y: -0.3 },
    },
    {
      selectors: [ '.gallery-image' ],
      className: 'hovered-gallery-image',
      lockPosition: true,
      dynamicSizeOffset: 0.3,
      borderRadius: 0,
      positionOffset: { y: -0.03 }
    },
    {
      selectors: ['.hero-text'],
      className: 'hovered-button-grow',
      autoSize: false
    }
  ]);

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

  function handleOnDown(e: MouseEvent | TouchEvent) {
    mouseDownAt = (e instanceof MouseEvent ? e.clientX : e.touches[0].clientX);
  }

  function handleOnUp() {
    mouseDownAt = 0;
    prevOffset = offset;
  }

  function handleOnMove(e: MouseEvent | TouchEvent) {
    if (mouseDownAt === 0) return;

    const track = document.getElementById("image-track");
    if (!track) return;

    const clientX = (e instanceof MouseEvent ? e.clientX : e.touches[0].clientX);
    const mouseDelta = mouseDownAt - clientX;
    
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const margin = (vmin * 5) / 100;
    const W = track.scrollWidth;
    const V = window.innerWidth;
    const limit = Math.max(0, (W - V) / 2 + margin);

    const nextOffsetUnconstrained = prevOffset - (mouseDelta * 0.8);
    offset = Math.max(Math.min(nextOffsetUnconstrained, limit), -limit);

    animateTrack(track, limit);
  }

  function handleWheel(e: WheelEvent) {
    const track = document.getElementById("image-track");
    if (!track || Math.abs(e.deltaX) === 0) return;

    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const margin = (vmin * 5) / 100;
    const W = track.scrollWidth;
    const V = window.innerWidth;
    const limit = Math.max(0, (W - V) / 2 + margin);

    const nextOffsetUnconstrained = offset - (e.deltaX * 1.8);
    offset = Math.max(Math.min(nextOffsetUnconstrained, limit), -limit);
    prevOffset = offset; // Keep dragging state in sync

    animateTrack(track, limit);
  }

  function animateTrack(track: HTMLElement, limit: number) {
    gsap.to(track, {
      x: offset,
      xPercent: -50,
      yPercent: -60,
      duration: 1.5,
      ease: "power3.out",
      overwrite: "auto"
    });

    const images = Array.from(track.getElementsByClassName("gallery-image"));
    for (const image of images) {
      const relativeProgress = limit !== 0 ? (offset / limit) : 0;
      const parallax = 50 - (relativeProgress * 10); 
      gsap.to(image, {
        objectPosition: `${parallax}% center`,
        duration: 1.8,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
  }

  onMount(() => {
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };

    const track = document.getElementById("image-track");
    if (track) {
      gsap.set(track, {
        x: 0,
        xPercent: -50,
        yPercent: -60
      });
      const images = Array.from(track.getElementsByClassName("gallery-image"));
      for (const image of images) {
        gsap.set(image, {
          objectPosition: "50% center"
        });
      }
    }

    window.addEventListener('mousemove', handleOnMove);
    window.addEventListener('touchmove', handleOnMove);
    window.addEventListener('mouseup', handleOnUp);
    window.addEventListener('touchend', handleOnUp);

    setTimeout(cursorReset, 10);

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
    const eyes = document.querySelectorAll('.eye') as globalThis.NodeListOf<HTMLElement>;
    if (anchor) {
      document.addEventListener('mousemove', (e) => {
        const rekt = anchor.getBoundingClientRect();
        const anchorX = rekt.left + rekt.width / 1.5;
        const anchorY = rekt.top + rekt.height / 3;

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
          <span class="text-container"><h2 class="tw">{t('proj.twaos.title.tw')}</h2></span>
          <span class="text-container"><h3 class="ao">{t('proj.twaos.title.ao')}</h3></span>
          <span class="text-container"><h1 class="sip">{t('proj.twaos.title.sip')}</h1></span>
        </div>
        <span class="text-container"><h5>{t('proj.twaos.desc.short')}</h5></span>
      </div>
      <div class="wrap-no-interact-all cards-wrapper">
        {#each pages as page}
          <div class="card-container">
            <a class="card" href={page.href} target="_blank">
              <div class="card-icon">
                <img src={page.icon} alt="{page.title} - icon" style="width: 8vmin; object-fit: contain;"/>
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
            <img class="eye" src="/media/TWAOS/Styled/SipEye.png" alt="SIPEYE-LEFT" style="bottom: 15vmin; left: 24vmin;" />
            <img class="eye" src="/media/TWAOS/Styled/SipEye.png" alt="SIPEYE-RIGHT" style="bottom: 17vmin; left: 32.8vmin;" />
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="canvas canvas-2">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      id="image-track" 
      role="region"
      aria-label="Gallery track"
      onmousedown={handleOnDown}
      ontouchstart={handleOnDown}
      onwheel={handleWheel}
      ondragstart={(e) => e.preventDefault()}
      draggable="false"
    >
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 1" draggable="false" ondragstart={(e) => e.preventDefault()}/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 2" draggable="false" ondragstart={(e) => e.preventDefault()}/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 3" draggable="false" ondragstart={(e) => e.preventDefault()}/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 4" draggable="false" ondragstart={(e) => e.preventDefault()}/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 5" draggable="false" ondragstart={(e) => e.preventDefault()}/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 6" draggable="false" ondragstart={(e) => e.preventDefault()}/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 7" draggable="false" ondragstart={(e) => e.preventDefault()}/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 8" draggable="false" ondragstart={(e) => e.preventDefault()}/>
      <img class="gallery-image" src="/media/TWAOS/gallery/gallery-1.png" alt="Gallery Showcase 9" draggable="false" ondragstart={(e) => e.preventDefault()}/>
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
    box-shadow: 0 -2vmin 5vmin rgba(0, 0, 0, 0.5);
  }

  #image-track {
    display: flex;
    gap: 4vmin;
    user-select: none;
    position: absolute;
    left: 50%;
    top: 50%;
    width: max-content;
    max-width: none;
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
    padding-top: 6vmin;
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
    margin: -1.7vmin;
    color: #ff9933;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 0 1vmin rgba(255, 123, 0, 0.7));
  }

  .hero h2 {
    font-family: 'Nightcore';
    font-size: 4rem;
    margin: -0.8vmin;
  }

  .hero h2.tw {
    font-family: 'Nightcore';
    font-size: 4rem;
    margin: -0.8vmin;
    color: #f65901;
    text-shadow: 0 0 10px rgba(246, 89, 1, 0.3), 0 0 20px rgba(246, 89, 1, 0.2), 0 0 30px rgba(246, 89, 1, 0.05);
  }

  .hero h3 {
    font-family: 'Nightcore';
    font-size: 3.5rem;
    margin: -0.5vmin;
  }

  .hero h3.ao {
    font-family: 'Nightcore';
    font-size: 3.5rem;
    margin: -0.5vmin;
    color: #f65901;
    text-shadow: 0 0 10px rgba(246, 89, 1, 0.3), 0 0 20px rgba(246, 89, 1, 0.2), 0 0 30px rgba(246, 89, 1, 0.05);
  }

  .hero h5 {
    font-family: 'Redwing';
    font-weight: 500;
    font-size: 1.5rem;
    margin: 2vmin;
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
    bottom: -10vmin;
    left: 2vmin;
    width: 40vmin;
    height: 40vmin;
  }

  .eye {
    position: absolute;
    bottom: 2vmin;
    right: 2vmin;
    width: 3vmin;
    height: 3vmin;
  }

  .sip-icon {
    display: grid;
    place-items: center;
  }

  .cards-wrapper {
    position: absolute;
    bottom: 5vmin;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    gap: 3.54vmin;
    z-index: 2;
  }

  .card-container {
    gap: 1vmin;
  }

  .card {
    font-family: 'Aileron';
    display: flex;
    flex-direction: line;
    align-items: left;
    padding: 1vmin;
    border-radius: 1.8vmin;
    text-decoration: none;
    color: #f65901;
    width: 35vmin;
    transition: transform 0.2s, background-color 0.2s ease;
    justify-content: left;
    text-align: left;
    gap: 1vmin;
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

  @media (max-width: 900px), (any-pointer: coarse) {
    #image-track {
      gap: 1rem;
      top: 54%;
    }

    #image-track > .gallery-image {
      width: min(68vw, 18rem);
      height: min(96vw, 25rem);
    }

    .hero {
      padding: 6.5rem 1rem 12rem;
    }

    .hero h1 {
      font-size: clamp(3.5rem, 14vw, 4.8rem);
    }

    .hero h2 {
      font-size: clamp(1.9rem, 7vw, 2.6rem);
    }

    .hero h3 {
      font-size: clamp(1.6rem, 6vw, 2.2rem);
    }

    .hero h5 {
      font-size: 1.02rem;
      max-width: 21rem;
      margin: 1.1rem 0 0;
    }

    .styled-sip {
      width: clamp(18rem, 56vw, 24rem);
      height: clamp(18rem, 56vw, 24rem);
      left: -2.6rem;
      bottom: -1.2rem;
      opacity: 0.9;
    }

    .eye {
      width: 1.4rem;
      height: 1.4rem;
    }

    .eyes .eye:first-child {
      bottom: 8.7rem !important;
      left: 10.8rem !important;
    }

    .eyes .eye:last-child {
      bottom: 10rem !important;
      left: 14.7rem !important;
    }

    .cards-wrapper {
      left: auto;
      right: max(1rem, env(safe-area-inset-right));
      bottom: max(1rem, env(safe-area-inset-bottom));
      transform: none;
      width: auto;
      gap: 0;
    }

    .card {
      width: 4rem;
      height: 4rem;
      padding: 0.8rem;
      border-radius: 1rem;
      gap: 0;
      align-items: center;
      justify-content: center;
    }

    .card-icon img {
      width: 2.2rem !important;
    }

    .card-content {
      display: none;
    }
  }

  @media (max-width: 560px) {
    .hero {
      padding-top: 5.75rem;
      padding-bottom: 13rem;
    }

    .hero h1 {
      font-size: clamp(3rem, 15vw, 4rem);
    }

    .hero h2 {
      font-size: clamp(1.65rem, 7vw, 2.15rem);
    }

    .hero h3 {
      font-size: clamp(1.4rem, 6vw, 1.9rem);
    }

    .hero h5 {
      font-size: 0.95rem;
      max-width: 18rem;
    }

    .styled-sip {
      width: 17rem;
      height: 17rem;
      left: -3.3rem;
      bottom: -0.8rem;
    }

    .eyes .eye:first-child {
      bottom: 7.8rem !important;
      left: 9.7rem !important;
    }

    .eyes .eye:last-child {
      bottom: 9rem !important;
      left: 13.2rem !important;
    }
  }
</style>
