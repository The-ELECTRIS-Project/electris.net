<script lang="ts">
  import { themeState } from '$lib/state/theme.svelte';
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
    inset: 0;
    pointer-events: none;
    z-index: var(--z-effects);
    overflow: hidden;
  }

  .scanlines,
  .vignette,
  .floating-blobs {
    position: absolute;
    inset: 0;
  }

  /* Fixed black, because the scanline and vignette darken whatever is behind them. */
  .scanlines {
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%,
      rgba(0, 0, 0, 0.05) 50%
    );
    background-size: 100% 4px;
    z-index: var(--z-raised);
  }

  .vignette {
    background: radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
    z-index: calc(var(--z-raised) + 1);
  }

  .blob {
    position: absolute;
    width: 44rem;
    height: 44rem;
    filter: blur(100px);
    opacity: 0.1;
    border-radius: var(--radius-round);
    animation: move 25s infinite alternate ease-in-out;
    pointer-events: none;
    /* the scale() in `move` would otherwise re-rasterise the 100px blur every frame */
    will-change: transform;
  }

  .blob-1 {
    top: -10%;
    left: -10%;
    background: var(--accent);
  }

  .blob-2 {
    bottom: -10%;
    right: -10%;
    background: var(--brand-electris);
    animation-duration: 30s;
    animation-delay: -5s;
  }

  .blob-3 {
    top: 40%;
    left: 60%;
    width: 22rem;
    height: 22rem;
    background: var(--brand-electro);
    animation-duration: 20s;
    animation-delay: -12s;
  }

  @keyframes move {
    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
    50% { transform: translate(5.5rem, 6.25rem) scale(1.2) rotate(90deg); }
    100% { transform: translate(-5.5rem, 3rem) scale(1) rotate(180deg); }
  }

  :global([data-color-scheme="light"]) .scanlines {
    background: linear-gradient(
      rgba(255, 255, 255, 0) 50%,
      color-mix(in srgb, var(--accent) 3%, transparent) 50%
    );
    background-size: 100% 4px;
  }

  :global([data-color-scheme="light"]) .vignette {
    background: radial-gradient(circle, transparent 70%, color-mix(in srgb, var(--accent) 10%, transparent) 100%);
  }

  :global([data-color-scheme="light"]) .blob {
    opacity: 0.05;
  }
</style>