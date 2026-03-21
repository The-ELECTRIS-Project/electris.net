<script lang="ts">
  import { themeState } from '$lib/stores/theme.svelte';
</script>

{#if themeState.theme === 'cyber-neotic'}
  <div class="cyber-effects-layer">
    <div class="scanlines"></div>
    <div class="vignette"></div>
    <div class="floating-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
  </div>
{/if}

<style>
  .cyber-effects-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
    overflow: hidden;
  }
  
  .scanlines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%, 
      rgba(0, 0, 0, 0.05) 50%
    );
    background-size: 100% 4px;
    z-index: 10;
  }
  
  .vignette {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
    z-index: 11;
  }

  .floating-blobs {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .blob {
    position: absolute;
    width: 70.8vmin;
    height: 70.8vmin;
    filter: blur(100px);
    opacity: 0.1;
    border-radius: 50%;
    animation: move 25s infinite alternate ease-in-out;
    pointer-events: none;
  }

  .blob-1 {
    top: -10%;
    left: -10%;
    background: var(--color-primary);
  }

  .blob-2 {
    bottom: -10%;
    right: -10%;
    background: var(--color-varrow);
    animation-duration: 30s;
    animation-delay: -5s;
  }

  .blob-3 {
    top: 40%;
    left: 60%;
    width: 35.4vmin;
    height: 35.4vmin;
    background: var(--color-electro);
    animation-duration: 20s;
    animation-delay: -12s;
  }

  @keyframes move {
    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
    50% { transform: translate(8.8vmin, 10vmin) scale(1.2) rotate(90deg); }
    100% { transform: translate(-8.8vmin, 5vmin) scale(1) rotate(180deg); }
  }

  :global([data-color-scheme="light"]) .scanlines {
    background: linear-gradient(
      rgba(255, 255, 255, 0) 50%, 
      color-mix(in srgb, var(--color-primary) 3%, transparent) 50%
    );
    background-size: 100% 4px;
  }

  :global([data-color-scheme="light"]) .vignette {
    background: radial-gradient(circle, transparent 70%, color-mix(in srgb, var(--color-primary) 10%, transparent) 100%);
  }

  :global([data-color-scheme="light"]) .blob {
    opacity: 0.05;
  }
</style>