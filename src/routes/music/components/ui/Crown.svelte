<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';

  let crownCanvas: HTMLCanvasElement | undefined = $state();
  let crownImage: HTMLImageElement | undefined = $state();
  let isHovered = $state(false);

  let maskImage: HTMLImageElement | undefined = $state();

  useHoverConfig([
    {
      selectors: ['.crown', '.crown-container'],
      className: 'hovered-crown',
      lockPosition: true,
      trackingTarget: '.crown-container',
      shape: { svg: '/icons/GEE/crown-outline.svg' },
      color: 'var(--circle-hover-crown)',
      dynamicSizeOffset: 3,
      effects: {
        glitch: {
          enabled: true,
          intensity: 1,
          frequency: 0.4,
          drift: 5,
          colorShift: true
        },
        outerGlow: {
          enabled: true,
          blur: 3,
          spread: 5,
          intensity: 0.8,
          pulse: {
            speed: 3,
            min: 0.3,
            max: 0.9
          }
        },
        innerGlow: true,
        shadow: {
          enabled: true,
          color: 'var(--circle-hover-crown)',
          blur: 1.5,
          spread: 0.5,
          opacity: 0.4
        }
      }
    }
  ]);

  function drawMask() {
    if (!crownCanvas || !maskImage) return;
    const ctx = crownCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, crownCanvas.width, crownCanvas.height);
      ctx.drawImage(maskImage, 0, 0);
    }
  }

  const handleCrownClick = async () => {
    await goto('/music/ELECTRO/album/GEE');
    console.log('Heavy is the head that chose to wear the crown.');
  };

  function checkPixelHit(event: MouseEvent) {
    if (!crownCanvas) return false;
    const rect = crownCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const scaleX = crownCanvas.width / rect.width;
    const scaleY = crownCanvas.height / rect.height;
    const canvasX = Math.floor(x * scaleX);
    const canvasY = Math.floor(y * scaleY);

    const ctx = crownCanvas.getContext('2d');
    if (!ctx) return false;
    try {
      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1);
      return pixel.data[3] > 0;
    } catch {
      return false;
    }
  }

  function handleMouseMove(event: MouseEvent) {
    const prev = isHovered;
    isHovered = checkPixelHit(event);
    if (prev !== isHovered) {
      (event.currentTarget as HTMLCanvasElement).style.cursor = isHovered ? 'pointer' : 'default';
    }
    if (isHovered) {
      drawMask();
    }
  }

  function handleCanvasClick(event: MouseEvent) {
    if (checkPixelHit(event)) handleCrownClick();
  }

  onMount(() => {
    maskImage = new Image();
    maskImage.src = '/icons/GEE/crown-HoverArea.png';
    maskImage.crossOrigin = 'anonymous';
    maskImage.onload = () => {
      if (!crownCanvas || !maskImage) return;
      crownCanvas.width = maskImage.width;
      crownCanvas.height = maskImage.height;
      const ctx = crownCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, maskImage.width, maskImage.height);
        ctx.drawImage(maskImage, 0, 0);
      }
    };

    if (crownCanvas && crownImage) {
      const ctx = crownCanvas.getContext('2d');
      crownImage.onload = () => {
        if (!ctx || !crownImage || !crownCanvas) return;
        crownCanvas.width = crownImage.naturalWidth;
        crownCanvas.height = crownImage.naturalHeight;
        ctx.clearRect(0, 0, crownCanvas.width, crownCanvas.height);
        ctx.drawImage(crownImage, 0, 0);
      };
      if (crownImage.complete && ctx) {
        crownCanvas.width = crownImage.naturalWidth;
        crownCanvas.height = crownImage.naturalHeight;
        ctx.clearRect(0, 0, crownCanvas.width, crownCanvas.height);
        ctx.drawImage(crownImage, 0, 0);
      }
    }
  });
</script>

<div class="crown">
  <div class="crown-container">
    <img 
      bind:this={crownImage}
      src="/icons/GEE/crown.png" 
      alt="Crown of Barbed Wire" 
      class="crown-image"
      class:hovered={isHovered}
    />
    <canvas 
      bind:this={crownCanvas}
      class="crown-canvas"
      onmousemove={handleMouseMove}
      onmouseleave={() => { isHovered = false; }}
      onclick={handleCanvasClick}
      role="button"
      tabindex="0"
      aria-label="Crown of Barbed Wire"
    ></canvas>
  </div>
</div>

<style>
  .crown {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* The crown is artwork, so it tracks the screen rather than the text size. */
  .crown-container {
    position: relative;
    max-width: 30vmin;
    max-height: 30vmin;
  }

  .crown-image {
    max-width: 30vmin;
    max-height: 30vmin;
    display: block;
    cursor: pointer;
    pointer-events: none;
  }

  .crown-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: default;
    background: none;
  }

  .crown-canvas:focus {
    outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
    outline-offset: 2px;
  }
</style>
