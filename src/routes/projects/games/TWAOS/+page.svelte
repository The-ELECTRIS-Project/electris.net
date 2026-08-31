<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
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
        dynamicSizeOffset: {
          width: -3
        },
        shape: `circle`,
        positionOffset: { x: -1.4, y: -0.3 },
    },
    {
        selectors: [ '.gallery-image' ],
        className: 'hovered-gallery-image',
        lockPosition: true,
        dynamicSizeOffset: 0.3,
        positionOffset: { y: -0.03 }
    },
    {
        selectors: ['.hero-text'],
        className: 'hovered-button-grow',
        autoSize: false
    },
    {
        selectors: ['.card'],
        className: 'hovered-game-steam-card',
        lockPosition: true,
        dynamicSizeOffset: {
            width: 1.6,
            height: 2
        },
        dynamicBorderRadiusOffset: 0.5,
        color: 'hsl(126, 99%, 48%)'
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

  // A drag across this much of the viewport travels the whole track.
  const SWEEP_FRACTION_POINTER = 0.5;
  const SWEEP_FRACTION_TOUCH = 1;

  function dragSpeed(limit: number, viewportWidth: number): number {
    if (limit <= 0) return 1;
    const sweep = window.matchMedia('(any-pointer: coarse)').matches
      ? SWEEP_FRACTION_TOUCH
      : SWEEP_FRACTION_POINTER;
    return (2 * limit) / (viewportWidth * sweep);
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

    const nextOffsetUnconstrained = prevOffset - (mouseDelta * dragSpeed(limit, V));
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
    const orbitReset = () => {
      const orbit = document.querySelector('.circle');
      if (orbit) {
        orbit.className = "circle";
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

    setTimeout(orbitReset, 10);

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
      <div class="hero-text wrap-no-interact-all">
        <div class="twaos-title">
          <span class="text-container"><h2 class="tw">{t('proj.twaos.title.tw')}</h2></span>
          <span class="text-container"><h3 class="ao">{t('proj.twaos.title.ao')}</h3></span>
          <span class="text-container"><h1 class="sip">{t('proj.twaos.title.sip')}</h1></span>
        </div>
        <span class="text-container"><h5>{t('proj.twaos.desc.short', "An Indie Game created by a Solo Developer")}</h5></span>
      </div>
      <div class="wrap-no-interact-all cards-wrapper">
        {#each pages as page}
          <div class="card-container">
            <a class="card" href={page.href} target="_blank">
              <div class="card-icon">
                <img src={page.icon} alt="{page.title} - icon" />
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
          <img class="eye eye-near" src="/media/TWAOS/Styled/SipEye.png" alt="" />
          <img class="eye eye-far" src="/media/TWAOS/Styled/SipEye.png" alt="" />
        </a>
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
    background-color: var(--surface-page);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 -1.5rem 3.7rem rgba(0, 0, 0, 0.5);
  }

  /* The gallery scales with the screen, not the text, so these stay in vmin. */
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
    padding-top: var(--layout-page-top);
    text-align: center;
    overflow: hidden;

    /* Sip's green, lifted off the mascot's eye sockets and brightened so it
       still reads as his colour at display size. */
    --sip-eye: #5eff00;
    --sip-ink: hsl(90, 100%, 71%);
    --sip-glow: var(--sip-eye);
    /* Picked against the video, so these do not follow the site theme. */
    --twaos-title-ink: hsl(32, 100%, 50%);
    --twaos-card-ink: hsl(126, 99%, 48%);
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
    transition: opacity var(--duration-fast) var(--ease-in-out);
  }

  .hero h1 {
    display: inline-block;
    font-family: var(--font-game);
    font-size: 8rem;
    margin: 0;
  }

  .hero h1.sip {
    padding-top: 0;
    padding-bottom: var(--space-3);
    margin: -1.25rem;
    color: var(--sip-ink);
    position: relative;
    z-index: var(--z-raised);
    filter: drop-shadow(0 0 0.75rem color-mix(in srgb, var(--sip-glow) 70%, transparent));
  }

  .hero h2 {
    font-family: var(--font-game);
    font-size: 4rem;
    margin: -0.6rem;
  }

  .hero h2.tw {
    color: var(--twaos-title-ink);
    text-shadow:
      0 0 0.6rem color-mix(in srgb, var(--twaos-title-ink) 30%, transparent),
      0 0 1.25rem color-mix(in srgb, var(--twaos-title-ink) 20%, transparent),
      0 0 1.9rem color-mix(in srgb, var(--twaos-title-ink) 5%, transparent);
  }

  .hero h3 {
    font-family: var(--font-game);
    font-size: 3.5rem;
    margin: -0.35rem;
  }

  .hero h3.ao {
    color: var(--twaos-title-ink);
    text-shadow:
      0 0 0.6rem color-mix(in srgb, var(--twaos-title-ink) 30%, transparent),
      0 0 1.25rem color-mix(in srgb, var(--twaos-title-ink) 20%, transparent),
      0 0 1.9rem color-mix(in srgb, var(--twaos-title-ink) 5%, transparent);
  }

  .hero h5 {
    font-family: var(--font-body);
    font-weight: 500;
    font-size: var(--text-xl);
    margin: var(--space-5);
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

  .sip-icon {
    display: grid;
    place-items: center;

    --sip-width: 29rem;
    /* Sip.svg's viewBox, so the link box matches the artwork with no letterboxing */
    --sip-aspect: 1.0766;
    --sip-offset-bottom: -7.4rem;
    --eye-size: calc(var(--sip-width) * 0.0759);
  }

  .styled-sip-link {
    position: absolute;
    left: var(--space-5);
    bottom: calc(var(--sip-offset-bottom) + var(--sip-width) * 0.0356);
    width: var(--sip-width);
    height: calc(var(--sip-width) / var(--sip-aspect));
  }

  .styled-sip {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Positions are percentages of the mascot box, so the eyes track it at any size. */
  .eye {
    position: absolute;
    left: var(--socket-x);
    top: var(--socket-y);
    width: var(--eye-size);
    height: var(--eye-size);
    margin-left: calc(var(--eye-size) / -2);
    margin-top: calc(var(--eye-size) / -2);
  }

  .eye-near {
    --socket-x: 58.75%;
    --socket-y: 32.51%;
  }

  /* Just inside the far socket's centre, so the pupil grazes the edge of the
     artwork at full reach instead of swinging clear of it. */
  .eye-far {
    --socket-x: 80.75%;
    --socket-y: 27.12%;
  }

  .cards-wrapper {
    position: absolute;
    bottom: var(--space-8);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    gap: var(--space-7);
    z-index: var(--z-raised);
  }

  .card-container {
    gap: var(--space-3);
  }

  .card {
    font-family: var(--font-ui);
    display: flex;
    padding: var(--space-3);
    border-radius: var(--radius-xl);
    text-decoration: none;
    color: var(--text-primary);
    width: 26rem;
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out);
    justify-content: left;
    text-align: left;
    gap: var(--space-3);
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

  .card-icon img {
    width: 5.9rem;
    object-fit: contain;
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card-content h2 {
    margin: 0;
    font-family: var(--font-game);
    font-size: var(--text-2xl);
    color: var(--twaos-card-ink);
  }

  .card-content p {
    font-family: var(--font-body);
    font-weight: 300;
    font-size: var(--text-md);
    margin: var(--space-1) 0 0;
    color: var(--twaos-card-ink);
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    #image-track {
      gap: var(--space-4);
      top: 54%;
    }

    #image-track > .gallery-image {
      width: min(68vw, 18rem);
      height: min(96vw, 25rem);
    }

    .hero {
      padding: calc(var(--layout-page-top) + var(--space-4)) var(--space-4) 12rem;
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
      font-size: var(--text-base);
      max-width: 21rem;
      margin: var(--space-4) 0 0;
    }

    .sip-icon {
      --sip-width: clamp(18rem, 56vw, 24rem);
      --sip-offset-bottom: -1.2rem;
    }

    .styled-sip-link {
      left: -2.6rem;
      opacity: 0.9;
    }

    .cards-wrapper {
      left: auto;
      right: max(var(--space-4), env(safe-area-inset-right));
      bottom: max(var(--space-4), env(safe-area-inset-bottom));
      transform: none;
      width: auto;
      gap: 0;
    }

    .card {
      width: var(--space-8);
      height: var(--space-8);
      padding: var(--space-3);
      border-radius: var(--radius-lg);
      gap: 0;
      align-items: center;
      justify-content: center;
    }

    .card-icon img {
      width: 2.2rem;
    }

    .card-content {
      display: none;
    }
  }

  @media (max-width: 560px) {
    .hero {
      padding-top: var(--layout-page-top);
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
      font-size: var(--text-sm);
      max-width: 18rem;
    }

    .sip-icon {
      --sip-width: 17rem;
      --sip-offset-bottom: -0.8rem;
    }

    .styled-sip-link {
      left: -3.3rem;
    }
  }
</style>