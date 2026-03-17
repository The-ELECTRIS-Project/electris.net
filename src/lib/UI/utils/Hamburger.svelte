<script>
  import { createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  
  const dispatch = createEventDispatcher();
  
  let isHovered = false;
  let buttonElement;
  
  function handleClick() {
    dispatch('toggle');
  }
  
  function handleMouseEnter() {
    isHovered = true;
  }
  
  function handleMouseLeave() {
    isHovered = false;
  }
  
  $: buttonClass = `hamburger-button ${isOpen ? 'open' : 'closed'} ${isHovered ? 'hovered' : ''}`;
</script>

<button
  bind:this={buttonElement}
  type="button"
  class={buttonClass}
  on:click={handleClick}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
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
    position: fixed;
    left: 1vmin;
    z-index: 121;
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
    transition: transform 0.3s ease;
  }
  
  .line {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
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
  
  .closed.hovered .line-top {
    transform: translateY(1vmin) translateX(1.5vmin) rotate(45deg);
    width: 3.5vmin;
  }
  
  .closed.hovered .line-middle {
    transform: translateX(0) scaleX(1);
    opacity: 1;
  }
  
  .closed.hovered .line-bottom {
    transform: translateY(-1vmin) translateX(1.5vmin) rotate(-45deg);
    width: 3.5vmin;
  }
  
  .open.hovered .line-top {
    transform: translateY(-0.9vmin) translateX(0.75vmin) rotate(-45deg);
    width: 3.5vmin;
  }
  
  .open.hovered .line-middle {
    transform: translateX(0.75vmin) scaleX(1);
    opacity: 1;
  }
  
  .open.hovered .line-bottom {
    transform: translateY(0.9vmin) translateX(0.75vmin) rotate(45deg);
    width: 3.5vmin;
  }
  
  .closed.hovered .hamburger-svg {
    animation: nudge-right 1s ease-in-out infinite;
  }
  
  .open.hovered .hamburger-svg {
    animation: nudge-left 1s ease-in-out infinite;
  }
  
  .hamburger-svg {
    transition: transform 0.3s ease-out;
  }
  
  .hovered .hamburger-svg {
    transition: none;
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
  
  .hamburger-animated:not(.hovered) .line {
    transition-delay: 0.1s;
  }
  
  .hamburger-animated.hovered .line {
    transition-delay: 0s;
  }
</style>