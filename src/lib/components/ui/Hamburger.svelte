<script lang="ts">
  let { isOpen = false, onToggle } = $props<{
    isOpen?: boolean;
    onToggle?: () => void;
  }>();
  
  let isHovered = $state(false);
  
  function handleClick() {
    onToggle?.();
  }
  
  function handleMouseEnter() {
    isHovered = true;
  }
  
  function handleMouseLeave() {
    isHovered = false;
  }
  
  let buttonClass = $derived(`hamburger-button ${isOpen ? 'open' : 'closed'} ${isHovered ? 'hovered' : ''}`);
</script>

<button
  type="button"
  class={buttonClass}
  onclick={handleClick}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={isOpen}
>
  <svg
    width="35"
    height="35"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    class="hamburger-svg"
  >
    <defs>
      <linearGradient id="hamburger-orange" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsla(22, 100%, 52%, 1.00)"/>
        <stop offset="100%" stop-color="hsla(22, 100%, 50%, 1.00)"/>
      </linearGradient>
    </defs>
    
    <rect 
      class="line line-top" 
      x="10" 
      y="25" 
      width="70" 
      height="8" 
      rx="4" 
      fill="url(#hamburger-orange)"
    />
    
    <rect 
      class="line line-middle" 
      x="10" 
      y="46" 
      width="70" 
      height="8" 
      rx="4" 
      fill="url(#hamburger-orange)"
    />
    
    <rect 
      class="line line-bottom" 
      x="10" 
      y="67" 
      width="70" 
      height="8" 
      rx="4" 
      fill="url(#hamburger-orange)"
    />
  </svg>
</button>

<style>
  .hamburger-button {
    user-select: none;
    height: 4vmin;
    width: 3.5vmin;
    position: absolute;
    top: 50%;
    left: var(--space-3);
    transform: translateY(-50%);
    z-index: calc(var(--z-nav) + 1);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .hamburger-svg {
    width: 100%;
    height: 100%;
    transition: transform var(--duration-slow) var(--ease-out);
  }

  .hovered .hamburger-svg {
    transition: none;
  }

  /* Declared here as well as on the rect so the arm length has two CSS ends to animate between. */
  .line {
    width: 70px;
    transform-box: view-box;
    transition:
      transform var(--duration-slow) var(--ease-in-out),
      width var(--duration-slow) var(--ease-in-out),
      opacity var(--duration-slow) var(--ease-in-out);
    transform-origin: center;
  }
  
  .closed .line-top {
    transform: translateY(0) rotate(0deg);
  }
  
  .closed .line-middle {
    transform: translateX(0) scaleX(1);
    opacity: 1;
  }
  
  .closed .line-bottom {
    transform: translateY(0) rotate(0deg);
  }

  .open .line-top {
    transform: translateY(0) rotate(0deg);
  }
  
  .open .line-middle {
    transform: translateX(0) scaleX(1);
    opacity: 1;
  }
  
  .open .line-bottom {
    transform: translateY(0) rotate(0deg);
  }
  
  /* The arms are rotated about the viewBox centre, so the offsets place each arm's far
     end on the shaft's tip: (80, 50) when closed, (18, 50) when open. */
  .closed.hovered .line-top {
    transform: translateY(16.3px) translateX(16.6px) rotate(45deg);
    width: 38px;
  }
  
  .closed.hovered .line-middle {
    transform: translateX(0) scaleX(1);
    opacity: 1;
  }
  
  .closed.hovered .line-bottom {
    transform: translateY(-16.3px) translateX(16.6px) rotate(-45deg);
    width: 38px;
  }
  
  .open.hovered .line-top {
    transform: translateY(-13.4px) translateX(11.1px) rotate(-45deg);
    width: 38px;
  }
  
  .open.hovered .line-middle {
    transform: translateX(8px) scaleX(1);
    opacity: 1;
  }
  
  .open.hovered .line-bottom {
    transform: translateY(13.4px) translateX(11.1px) rotate(45deg);
    width: 38px;
  }
  
  .closed.hovered .hamburger-svg {
    animation: nudge-right 1s ease-in-out infinite;
  }
  
  .open.hovered .hamburger-svg {
    animation: nudge-left 1s ease-in-out infinite;
  }
  
  @keyframes nudge-right {
    0%, 70%, 100% {
      transform: translateX(0);
    }
    15%, 35% {
      transform: translateX(3px);
    }
  }
  
  @keyframes nudge-left {
    0%, 70%, 100% {
      transform: translateX(0);
    }
    15%, 35% {
      transform: translateX(-3px);
    }
  }
  
  @media (max-width: 900px) {
    .hamburger-button {
      /* The navbar only pads for the safe area at the top, so centring shifts by half of it. */
      top: calc(50% + (env(safe-area-inset-top) * 0.5));
      left: var(--space-4);
      width: 2rem;
      height: 2rem;
    }
  }

  @media (any-pointer: coarse) {
    /* Widens the tap target without pushing the icon off the navbar's padding line. */
    .hamburger-button::after {
      content: '';
      position: absolute;
      inset: -0.75rem;
    }

    .closed.hovered .hamburger-svg,
    .open.hovered .hamburger-svg {
      animation: none;
    }
  }
</style>
