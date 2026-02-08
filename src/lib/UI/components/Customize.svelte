<script lang="ts">
  import { onMount } from 'svelte';
  import { mods } from '$lib/stores/customization';

  let isMenuOpen = false;
  let isClosing = false;
  let buttonElement: HTMLButtonElement;
  
  let gridCols = $mods.gridCols;
  let gridRows = $mods.gridRows;
  let openLinksInNewTabs = $mods.openLinksInNewTabs;
  let showQuickPins = $mods.showQuickPins;
  let showSearchBar = $mods.showSearchBar;
  
  const MIN_COLS = 2;
  const MAX_COLS = 8;
  const MIN_ROWS = 1;
  const MAX_ROWS = 3;

  $: gridCols = $mods.gridCols;
  $: gridRows = $mods.gridRows;
  $: openLinksInNewTabs = $mods.openLinksInNewTabs;
  $: showQuickPins = $mods.showQuickPins;
  $: showSearchBar = $mods.showSearchBar;

  onMount(() => {
    mods.init();
  });

  function updateCols(delta: number) {
    const newCols = gridCols + delta;
    if (newCols >= MIN_COLS && newCols <= MAX_COLS) {
      mods.updateSetting('gridCols', newCols);
    }
  }

  function updateRows(delta: number) {
    const newRows = gridRows + delta;
    if (newRows >= MIN_ROWS && newRows <= MAX_ROWS) {
      mods.updateSetting('gridRows', newRows);
    }
  }

  function toggleLinksInNewTabs() {
    mods.updateSetting('openLinksInNewTabs', !openLinksInNewTabs);
  }

  function toggleQuickPins() {
    mods.updateSetting('showQuickPins', !showQuickPins);
  }

  function toggleSearchBar() {
    mods.updateSetting('showSearchBar', !showSearchBar);
  }

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      isMenuOpen = true;
      isClosing = false;
    }
  }

  function closeMenu() {
    if (isMenuOpen && !isClosing) {
      isClosing = true;
      setTimeout(() => {
        isMenuOpen = false;
        isClosing = false;
      }, 250);
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeMenu();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="customize-container">
  <button bind:this={buttonElement} class="customize-button" on:click={toggleMenu} class:active={isMenuOpen} aria-label="Customization menu">
    <img src="/icons/buttons/pen.svg" alt="Customize" class="pen-icon" />
  </button>

  {#if isMenuOpen}
    <div 
      class="menu-overlay" 
      role="button"
      tabindex="0"
      class:closing={isClosing}
      on:click={handleOverlayClick}
      on:keydown={(e) => e.key === 'Escape' && {handleOverlayClick}}
      aria-label="Close Menu"
    >
      <div class="menu-content" class:closing={isClosing}>
        <div class="menu-header">
          <h2>Customize</h2>
          <button 
            class="edit-close-button" 
            on:click={closeMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <div class="menu-body">
          <div class="settings-section">
            <h3 class="settings-title">Display Options</h3>
            
            <div class="setting-group">
              <div class="setting-row">
                <label class="setting-label">
                  Open Links in New Tabs
                  <button 
                    class="toggle-switch" 
                    class:active={openLinksInNewTabs}
                    on:click={toggleLinksInNewTabs}
                    aria-label="Toggle open links in new tabs"
                  >
                    <span class="toggle-slider"></span>
                  </button>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-row">
                <label class="setting-label">
                  Show Quick Pins
                  <button 
                    class="toggle-switch" 
                    class:active={showQuickPins}
                    on:click={toggleQuickPins}
                    aria-label="Toggle quick pins visibility"
                  >
                    <span class="toggle-slider"></span>
                  </button>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-row">
                <label class="setting-label">
                  Show Search Bar
                  <button 
                    class="toggle-switch" 
                    class:active={showSearchBar}
                    on:click={toggleSearchBar}
                    aria-label="Toggle search bar visibility"
                  >
                    <span class="toggle-slider"></span>
                  </button>
                </label>
              </div>
            </div>
          </div>

          {#if $mods.showQuickPins}
            <div class="settings-section">
              <h3 class="settings-title">Grid Layout</h3>
              
              <div class="setting-group">
                <div class="setting-row">
                  <label class="setting-label">
                    Columns
                    <div class="setting-control">
                      <button 
                        class="control-btn"
                        on:click={() => updateCols(-1)}
                        disabled={gridCols <= MIN_COLS}
                        aria-label="Decrease columns"
                      >
                        −
                      </button>
                      <span class="control-value">{gridCols}</span>
                      <button 
                        class="control-btn"
                        on:click={() => updateCols(1)}
                        disabled={gridCols >= MAX_COLS}
                        aria-label="Increase columns"
                      >
                        +
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <div class="setting-group">
                <div class="setting-row">
                  <label class="setting-label">
                    Rows
                    <div class="setting-control">
                      <button 
                        class="control-btn"
                        on:click={() => updateRows(-1)}
                        disabled={gridRows <= MIN_ROWS}
                        aria-label="Decrease rows"
                      >
                        −
                      </button>
                      <span class="control-value">{gridRows}</span>
                      <button 
                        class="control-btn"
                        on:click={() => updateRows(1)}
                        disabled={gridRows >= MAX_ROWS}
                        aria-label="Increase rows"
                      >
                        +
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <div class="grid-info">
                <span class="info-text">{gridCols * gridRows} pins total</span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .customize-container {
    position: fixed;
    bottom: 1vw;
    right: 1vw;
    z-index: 100;
  }

  .customize-button {
    width: 4vh;
    height: 4vh;
    background: hsl(20, 95%, 51%);
    border: 0.1vh solid hsl(20, 95%, 61%);
    border-radius: 0.8vh;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 0.2vh 0.4vh hsla(20, 95%, 51%, 0.2);
    backdrop-filter: blur(0.5vh);
    position: relative;
    overflow: hidden;
  }

  .customize-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      hsla(0, 0%, 100%, 0.2),
      transparent
    );
    transition: left 0.4s ease;
  }

  .customize-button:hover {
    transform: translateY(-0.2vh);
    background: hsl(20, 95%, 56%);
    border-color: hsl(20, 95%, 66%);
    box-shadow: 0 0.3vh 0.6vh hsla(20, 95%, 51%, 0.3);
  }

  .customize-button:hover::before {
    left: 100%;
  }

  .customize-button:active {
    transform: translateY(-0.1vh) scale(0.98);
  }

  .customize-button.active {
    background: hsl(20, 95%, 46%);
    border-color: hsl(20, 95%, 56%);
    transform: translateY(-0.1vh);
  }

  .pen-icon {
    width: 1.8vh;
    height: 1.8vh;
    transform: rotate(15deg);
    transition: all 0.3s ease;
    filter: brightness(0) invert(1);
  }

  .customize-button:hover .pen-icon {
    transform: rotate(35deg) scale(1.1);
  }

  .customize-button.active .pen-icon {
    transform: rotate(15deg) scale(1.1);
  }

  .menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: hsla(0, 0%, 0%, 0.35);
    backdrop-filter: blur(0.8vh);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 999;
  }

  .menu-overlay.closing {
    animation: fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .menu-content {
    width: 60vw;
    max-width: 80vh;
    max-height: 80vh;
    background: hsl(240, 10%, 10%);
    border: 0.2vh solid hsl(20, 95%, 51%);
    border-radius: 2vh;
    box-shadow: 
      0 2vh 4vh hsla(0, 0%, 0%, 0.5),
      0 0 3vh hsla(20, 95%, 51%, 0.3);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .menu-content.closing {
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .menu-header {
    padding: 2vh 3vw;
    border-bottom: 0.1vh solid hsl(20, 95%, 51%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: hsl(240, 10%, 12%);
  }

  .menu-header h2 {
    margin: 0;
    font-size: 2.5vh;
    font-family: 'Letric', sans-serif;
    color: hsl(20, 95%, 61%);
    text-shadow: 0 0 1vh hsla(20, 95%, 51%, 0.3);
  }

  .edit-close-button {
    width: 4vh;
    height: 4vh;
    background: transparent;
    border: 0.1vh solid hsl(0, 0%, 40%);
    border-radius: 0.8vh;
    color: hsl(0, 0%, 70%);
    font-size: 2vh;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .edit-close-button:hover {
    background: hsl(0, 70%, 50%);
    border-color: hsl(0, 70%, 60%);
    color: white;
    transform: scale(1.05);
  }

  .menu-body {
    flex: 1;
    padding: 3vh 3vw;
    overflow-y: auto;
  }

  .settings-section {
    max-width: 100%;
    margin-bottom: 3vh;
  }

  .settings-section:last-child {
    margin-bottom: 0;
  }

  .settings-title {
    font-size: 1.8vh;
    font-family: 'Redwing', sans-serif;
    color: hsl(0, 0%, 90%);
    margin: 0 0 2.5vh 0;
    font-weight: 500;
  }

  .setting-group {
    margin-bottom: 1.8vh;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .setting-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    font-size: 1.5vh;
    color: hsl(0, 0%, 70%);
    font-family: 'Redwing', sans-serif;
    font-weight: 400;
  }

  .setting-control {
    display: flex;
    align-items: center;
    gap: 1.2vh;
  }

  .control-btn {
    width: 3.2vh;
    height: 3.2vh;
    background: hsl(240, 10%, 15%);
    border: 0.1vh solid hsl(0, 0%, 25%);
    border-radius: 0.5vh;
    color: hsl(0, 0%, 70%);
    font-size: 2vh;
    font-weight: normal;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    font-family: 'Redwing', sans-serif;
  }

  .control-btn:hover:not(:disabled) {
    background: hsl(240, 10%, 20%);
    border-color: hsl(20, 95%, 51%);
    color: hsl(20, 95%, 61%);
  }

  .control-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .control-btn:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  .control-value {
    font-size: 1.6vh;
    font-weight: 500;
    color: hsl(0, 0%, 90%);
    min-width: 3vh;
    text-align: center;
    font-family: 'Redwing', sans-serif;
  }

  .grid-info {
    margin-top: 2.5vh;
    padding-top: 1.5vh;
    border-top: 0.1vh solid hsl(0, 0%, 20%);
  }

  .info-text {
    font-size: 1.3vh;
    color: hsl(0, 0%, 55%);
    font-family: 'Redwing', sans-serif;
  }

  .toggle-switch {
    position: relative;
    width: 5vh;
    height: 2.6vh;
    background: hsl(240, 10%, 15%);
    border: 0.1vh solid hsl(0, 0%, 25%);
    border-radius: 1.3vh;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .toggle-switch::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      hsla(20, 95%, 51%, 0.1) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .toggle-switch:hover::before {
    opacity: 1;
  }

  .toggle-switch.active {
    background: hsl(20, 95%, 51%);
    border-color: hsl(20, 95%, 61%);
    box-shadow: 
      0 0 1vh hsla(20, 95%, 51%, 0.4),
      inset 0 0.1vh 0.2vh hsla(0, 0%, 100%, 0.2);
  }

  .toggle-slider {
    position: absolute;
    top: 0.3vh;
    left: 0.3vh;
    width: 2vh;
    height: 2vh;
    background: hsl(0, 0%, 70%);
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0.2vh 0.4vh hsla(0, 0%, 0%, 0.3);
  }

  .toggle-switch.active .toggle-slider {
    transform: translateX(2.4vh);
    background: hsl(0, 0%, 100%);
    box-shadow: 
      0 0.2vh 0.6vh hsla(0, 0%, 0%, 0.4),
      0 0 0.8vh hsla(20, 95%, 51%, 0.6);
  }

  .toggle-switch:hover .toggle-slider {
    box-shadow: 0 0.3vh 0.6vh hsla(0, 0%, 0%, 0.4);
  }

  .toggle-switch.active:hover .toggle-slider {
    box-shadow: 
      0 0.3vh 0.8vh hsla(0, 0%, 0%, 0.5),
      0 0 1.2vh hsla(20, 95%, 51%, 0.8);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(4vh) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(4vh) scale(0.95);
    }
  }

  /* Mobile */
  @media (max-width: 48vh) {
    .customize-button {
      width: 5vh;
      height: 5vh;
      bottom: 1vh;
      right: 2vw;
    }

    .pen-icon {
      width: 2.2vh;
      height: 2.2vh;
    }

    .menu-content {
      width: 90vw;
      height: 70vh;
      margin: 5vh;
    }

    .menu-header {
      padding: 2vh 4vw;
    }

    .menu-body {
      padding: 2vh 4vw;
    }

    .menu-header h2 {
      font-size: 3vh;
    }

    .toggle-switch {
      width: 6vh;
      height: 3vh;
    }

    .toggle-slider {
      width: 2.4vh;
      height: 2.4vh;
    }

    .toggle-switch.active .toggle-slider {
      transform: translateX(3vh);
    }
  }

  @media (max-width: 73.4vh) {
    .menu-content {
      width: 85vw;
      height: 65vh;
    }
  }
</style>