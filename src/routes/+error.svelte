<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  let error = $derived(page.error);
  let status = $derived(page.status);

  onMount(() => {
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };

    setTimeout(cursorReset, 10);
  });

  const goBack = () => {
    history.back();
  };
</script>

<svelte:head>
  <title>Error {status} | ELECTRIS</title>
</svelte:head>

<div class="error-page">
  <div class="error-container">
    <div class="error-icon">
      <div class="broken-gear gear-1"></div>
      <div class="broken-gear gear-2"></div>
      <div class="error-sparks">
        <div class="error-spark spark-1"></div>
        <div class="error-spark spark-2"></div>
        <div class="error-spark spark-3"></div>
        <div class="error-spark spark-4"></div>
      </div>
      <div class="crack-line"></div>
    </div>

    <div class="error-content">
      <h1>
        <span class="error-text-glitch" data-text="ERROR">ERROR</span>
        <span class="status-glitch" data-text="{status}"> {status}</span>
      </h1>

      {#if status === 404}
        <p class="error-message">Page not found in the ELECTRIS project</p>
        <p class="error-submessage">The page you're looking for has disappeared or never existed</p>
      {:else}
        <p class="error-message">Something went wrong in the ELECTRIS system</p>
        <p class="error-submessage">{error?.message || 'An unexpected error occurred'}</p>
      {/if}

      <div class="error-actions">
        <a href="/" class="return-button">
          <span class="button-text">Return to Base</span>
          <div class="button-spark"></div>
        </a>
        <button onclick={goBack} class="back-button">
          <span class="button-text">Go Back</span>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .error-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4vmin 2vmin;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .error-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(246, 89, 1, 0.03) 50%, transparent 70%);
    animation: error-sweep 5s ease-in-out infinite;
    pointer-events: none;
  }

  .error-container {
    position: relative;
    z-index: 2;
    max-width: 60vmin;
  }

  .error-icon {
    position: relative;
    margin-bottom: 4vmin;
    width: 10vmin;
    height: 10vmin;
    margin-left: auto;
    margin-right: auto;
  }

  .broken-gear {
    position: absolute;
    border-radius: 50%;
    border: 0.3vmin solid #f65901;
    animation: broken-rotate 4s ease-in-out infinite;
  }

  .broken-gear::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background: radial-gradient(circle, transparent 40%, #f65901 42%, #f65901 58%, transparent 60%);
  }

  .gear-1 {
    width: 7vmin;
    height: 7vmin;
    top: 0;
    left: 1.5vmin;
    animation-duration: 3s;
  }

  .gear-2 {
    width: 5vmin;
    height: 5vmin;
    top: 2.5vmin;
    right: 0;
    animation-direction: reverse;
    animation-duration: 4s;
    opacity: 0.7;
  }

  .crack-line {
    position: absolute;
    top: 3vmin;
    left: 3vmin;
    width: 4vmin;
    height: 0.2vmin;
    background: linear-gradient(45deg, transparent, #ff3300, transparent);
    transform: rotate(45deg);
    animation: crack-glow 2s ease-in-out infinite;
  }

  .crack-line::before {
    content: '';
    position: absolute;
    top: 1vmin;
    left: 1vmin;
    width: 2vmin;
    height: 0.1vmin;
    background: linear-gradient(45deg, transparent, #ff3300, transparent);
    transform: rotate(-30deg);
  }

  .error-sparks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .error-spark {
    position: absolute;
    width: 0.3vmin;
    height: 0.3vmin;
    background: #ff3300;
    border-radius: 50%;
    animation: error-sparkle 1.5s ease-in-out infinite;
    box-shadow: 0 0 0.5vmin #ff3300;
  }

  .spark-1 {
    top: 10%;
    left: 85%;
    animation-delay: 0s;
  }

  .spark-2 {
    top: 80%;
    left: 15%;
    animation-delay: 0.4s;
  }

  .spark-3 {
    top: 20%;
    left: 20%;
    animation-delay: 0.8s;
  }

  .spark-4 {
    top: 70%;
    left: 80%;
    animation-delay: 1.2s;
  }

  .error-content h1 {
    font-family: 'Letric';
    font-size: 3rem;
    margin: 0 0 2vmin 0;
    position: relative;
  }

  .error-text-glitch, .status-glitch {
    position: relative;
    animation: error-glitch 2s ease-in-out infinite;
    text-shadow: 0.1vmin 0.1vmin 0.2vmin rgba(255, 51, 0, 0.3);
    display: inline-block;
    color: #ff3300;
  }

  .error-text-glitch {
    font-family: 'Letric';
  }

  .status-glitch {
    font-family: 'Redwing';
    font-weight: 600;
  }

  .error-text-glitch::before,
  .error-text-glitch::after,
  .status-glitch::before,
  .status-glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.6;
  }

  .error-text-glitch::before,
  .status-glitch::before {
    animation: error-glitch-1 2s ease-in-out infinite;
    color: #ff6600;
    z-index: -1;
  }

  .error-text-glitch::after,
  .status-glitch::after {
    animation: error-glitch-2 2s ease-in-out infinite;
    color: #ff0033;
    z-index: -2;
  }

  .error-message {
    font-family: 'Redwing';
    font-size: 1.3rem;
    margin-bottom: 1vmin;
    font-weight: 500;
    color: #f65901;
  }

  .error-submessage {
    font-family: 'Redwing';
    font-size: 1rem;
    margin-bottom: 4vmin;
    opacity: 0.8;
    font-weight: 300;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 2vmin;
    align-items: center;
  }

  .return-button, .back-button {
    position: relative;
    padding: 1.2vmin 3vmin;
    border: 0.2vmin solid #f65901;
    background: rgba(246, 89, 1, 0.1);
    color: #f65901;
    font-family: 'Redwing';
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: 0.5vmin;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    overflow: hidden;
  }

  .return-button:hover, .back-button:hover {
    background: rgba(246, 89, 1, 0.2);
    box-shadow: 0 0 1vmin rgba(246, 89, 1, 0.5);
    transform: translateY(-0.2vmin);
  }

  .button-text {
    position: relative;
    z-index: 2;
  }

  .button-spark {
    position: absolute;
    top: 50%;
    right: 1vmin;
    width: 0.3vmin;
    height: 0.3vmin;
    background: #f65901;
    border-radius: 50%;
    transform: translateY(-50%);
    animation: button-spark-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 0.5vmin #f65901;
  }

  @media (max-width: 768px) {
    .error-content h1 {
      font-size: 2.2rem;
    }

    .error-message {
      font-size: 1.1rem;
    }

    .error-submessage {
      font-size: 0.9rem;
    }

    .error-actions {
      flex-direction: column;
    }
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .error-page {
      padding: 6rem 1rem 3rem;
    }

    .error-container {
      max-width: min(28rem, 100%);
    }

    .return-button,
    .back-button {
      min-height: 3rem;
      padding: 0.9rem 1.5rem;
      border-radius: 0.85rem;
    }
  }

  @keyframes error-sweep {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }

  @keyframes broken-rotate {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(90deg); }
    50% { transform: rotate(180deg); }
    75% { transform: rotate(270deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes crack-glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; box-shadow: 0 0 1vmin #ff3300; }
  }

  @keyframes error-sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    25% { opacity: 1; transform: scale(1.5); }
    50% { opacity: 0.7; transform: scale(1); }
    75% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes error-glitch {
    0%, 100% { transform: translate(0); }
    10% { transform: translate(-0.15vmin, 0.15vmin); }
    20% { transform: translate(-0.15vmin, -0.15vmin); }
    30% { transform: translate(0.15vmin, 0.15vmin); }
    40% { transform: translate(0.15vmin, -0.15vmin); }
    50% { transform: translate(0); }
    60% { transform: translate(-0.1vmin, 0.1vmin); }
    70% { transform: translate(0.1vmin, -0.1vmin); }
    80% { transform: translate(0); }
    90% { transform: translate(-0.15vmin, 0.15vmin); }
  }

  @keyframes error-glitch-1 {
    0%, 100% { transform: translate(0); opacity: 0.6; }
    10% { transform: translate(-0.3vmin, 0.3vmin); opacity: 0.4; }
    20% { transform: translate(-0.3vmin, -0.3vmin); opacity: 0.4; }
    30% { transform: translate(0.3vmin, 0.3vmin); opacity: 0.4; }
    40% { transform: translate(0.3vmin, -0.3vmin); opacity: 0.4; }
    50% { transform: translate(0); opacity: 0.6; }
    60% { transform: translate(-0.2vmin, 0.2vmin); opacity: 0.5; }
    70% { transform: translate(0.2vmin, -0.2vmin); opacity: 0.5; }
    80% { transform: translate(0); opacity: 0.6; }
    90% { transform: translate(-0.3vmin, 0.3vmin); opacity: 0.4; }
  }

  @keyframes error-glitch-2 {
    0%, 100% { transform: translate(0); opacity: 0.6; }
    10% { transform: translate(0.3vmin, -0.3vmin); opacity: 0.4; }
    20% { transform: translate(0.3vmin, 0.3vmin); opacity: 0.4; }
    30% { transform: translate(-0.3vmin, -0.3vmin); opacity: 0.4; }
    40% { transform: translate(-0.3vmin, 0.3vmin); opacity: 0.4; }
    50% { transform: translate(0); opacity: 0.6; }
    60% { transform: translate(0.2vmin, -0.2vmin); opacity: 0.5; }
    70% { transform: translate(-0.2vmin, 0.2vmin); opacity: 0.5; }
    80% { transform: translate(0); opacity: 0.6; }
    90% { transform: translate(0.3vmin, -0.3vmin); opacity: 0.4; }
  }

  @keyframes button-spark-pulse {
    0%, 100% { opacity: 0.5; transform: translateY(-50%) scale(1); }
    50% { opacity: 1; transform: translateY(-50%) scale(1.5); }
  }
</style>
