<script lang="ts">
  import { onMount } from 'svelte';
  import { modsState } from '$lib/stores/customization.svelte';

  let isMenuOpen = $state(false);
  let isClosing = $state(false);
  let buttonElement: HTMLButtonElement | undefined = $state();
  
  let gridCols = $derived(modsState.config.gridCols);
  let gridRows = $derived(modsState.config.gridRows);
  let openLinksInNewTabs = $derived(modsState.config.openLinksInNewTabs);
  let showQuickPins = $derived(modsState.config.showQuickPins);
  let showSearchBar = $derived(modsState.config.showSearchBar);
  
  const MIN_COLS = 2;
  const MAX_COLS = 8;
  const MIN_ROWS = 1;
  const MAX_ROWS = 3;

  onMount(() => {
    modsState.init();
  });

  function updateCols(delta: number) {
    const newCols = gridCols + delta;
    if (newCols >= MIN_COLS && newCols <= MAX_COLS) {
      modsState.updateSetting('gridCols', newCols);
    }
  }

  function updateRows(delta: number) {
    const newRows = gridRows + delta;
    if (newRows >= MIN_ROWS && newRows <= MAX_ROWS) {
      modsState.updateSetting('gridRows', newRows);
    }
  }

  function toggleLinksInNewTabs() {
    modsState.updateSetting('openLinksInNewTabs', !openLinksInNewTabs);
  }

  function toggleQuickPins() {
    modsState.updateSetting('showQuickPins', !showQuickPins);
  }

  function toggleSearchBar() {
    modsState.updateSetting('showSearchBar', !showSearchBar);
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

  function handleOverlayClick(event: MouseEvent | KeyboardEvent) {
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

<svelte:window onkeydown={handleKeydown} />

<div class="customize-container">
  <button bind:this={buttonElement} class="customize-button" onclick={toggleMenu} class:active={isMenuOpen} aria-label="Customization menu">
    <img src="/icons/buttons/pen.svg" alt="Customize" class="pen-icon" />
  </button>

  {#if isMenuOpen}
    <div 
      class="menu-overlay" 
      role="button"
      tabindex="0"
      class:closing={isClosing}
      onclick={handleOverlayClick}
      onkeydown={(e) => e.key === 'Escape' && handleOverlayClick(e)}
      aria-label="Close Menu"
    >
      <div class="menu-content" class:closing={isClosing}>
        <div class="menu-header">
          <h2>Customize</h2>
          <button 
            class="edit-close-button" 
            onclick={closeMenu}
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
                    onclick={toggleLinksInNewTabs}
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
                    onclick={toggleQuickPins}
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
                    onclick={toggleSearchBar}
                    aria-label="Toggle search bar visibility"
                  >
                    <span class="toggle-slider"></span>
                  </button>
                </label>
              </div>
            </div>
          </div>

          {#if modsState.config.showQuickPins}
            <div class="settings-section">
              <h3 class="settings-title">Grid Layout</h3>
              
              <div class="setting-group">
                <div class="setting-row">
                  <label class="setting-label">
                    Columns
                    <div class="setting-control">
                      <button 
                        class="control-btn"
                        onclick={() => updateCols(-1)}
                        disabled={gridCols <= MIN_COLS}
                        aria-label="Decrease columns"
                      >
                        −
                      </button>
                      <span class="control-value">{gridCols}</span>
                      <button 
                        class="control-btn"
                        onclick={() => updateCols(1)}
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
                        onclick={() => updateRows(-1)}
                        disabled={gridRows <= MIN_ROWS}
                        aria-label="Decrease rows"
                      >
                        −
                      </button>
                      <span class="control-value">{gridRows}</span>
                      <button 
                        class="control-btn"
                        onclick={() => updateRows(1)}
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
    bottom: 1.77vmin;
    right: 1.77vmin;
    z-index: 100;
  }

  .customize-button {
    width: 4vmin;
    height: 4vmin;
    background: hsl(20, 95%, 51%);
    border: 0.1vmin solid hsl(20, 95%, 61%);
    border-radius: 0.8vmin;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 0.2vmin 0.4vmin hsla(20, 95%, 51%, 0.2);
    backdrop-filter: blur(0.5vmin);
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
    transform: translateY(-0.2vmin);
    background: hsl(20, 95%, 56%);
    border-color: hsl(20, 95%, 66%);
    box-shadow: 0 0.3vmin 0.6vmin hsla(20, 95%, 51%, 0.3);
  }

  .customize-button:hover::before {
    left: 100%;
  }

  .customize-button:active {
    transform: translateY(-0.1vmin) scale(0.98);
  }

  .customize-button.active {
    background: hsl(20, 95%, 46%);
    border-color: hsl(20, 95%, 56%);
    transform: translateY(-0.1vmin);
  }

  .pen-icon {
    width: 1.8vmin;
    height: 1.8vmin;
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
    backdrop-filter: blur(0.8vmin);
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
    width: 106.2vmin;
    max-width: 80vmin;
    max-height: 80vmin;
    background: hsl(240, 10%, 10%);
    border: 0.2vmin solid hsl(20, 95%, 51%);
    border-radius: 2vmin;
    box-shadow: 
      0 2vmin 4vmin hsla(0, 0%, 0%, 0.5),
      0 0 3vmin hsla(20, 95%, 51%, 0.3);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .menu-content.closing {
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .menu-header {
    padding: 2vmin 5.31vmin;
    border-bottom: 0.1vmin solid hsl(20, 95%, 51%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: hsl(240, 10%, 12%);
  }

  .menu-header h2 {
    margin: 0;
    font-size: 2.5vmin;
    font-family: 'Letric', Aileron;
    color: hsl(20, 95%, 61%);
    text-shadow: 0 0 1vmin hsla(20, 95%, 51%, 0.3);
  }

  .edit-close-button {
    width: 4vmin;
    height: 4vmin;
    background: transparent;
    border: 0.1vmin solid hsl(0, 0%, 40%);
    border-radius: 0.8vmin;
    color: hsl(0, 0%, 70%);
    font-size: 2vmin;
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
    padding: 3vmin 5.31vmin;
    overflow-y: auto;
  }

  .settings-section {
    max-width: 100%;
    margin-bottom: 3vmin;
  }

  .settings-section:last-child {
    margin-bottom: 0;
  }

  .settings-title {
    font-size: 1.8vmin;
    font-family: 'Redwing', Aileron;
    color: hsl(0, 0%, 90%);
    margin: 0 0 2.5vmin 0;
    font-weight: 500;
  }

  .setting-group {
    margin-bottom: 1.8vmin;
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
    font-size: 1.5vmin;
    color: hsl(0, 0%, 70%);
    font-family: 'Redwing', Aileron;
    font-weight: 400;
  }

  .setting-control {
    display: flex;
    align-items: center;
    gap: 1.2vmin;
  }

  .control-btn {
    width: 3.2vmin;
    height: 3.2vmin;
    background: hsl(240, 10%, 15%);
    border: 0.1vmin solid hsl(0, 0%, 25%);
    border-radius: 0.5vmin;
    color: hsl(0, 0%, 70%);
    font-size: 2vmin;
    font-weight: normal;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    font-family: 'Redwing', Aileron;
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
    font-size: 1.6vmin;
    font-weight: 500;
    color: hsl(0, 0%, 90%);
    min-width: 3vmin;
    text-align: center;
    font-family: 'Redwing', Aileron;
  }

  .grid-info {
    margin-top: 2.5vmin;
    padding-top: 1.5vmin;
    border-top: 0.1vmin solid hsl(0, 0%, 20%);
  }

  .info-text {
    font-size: 1.3vmin;
    color: hsl(0, 0%, 55%);
    font-family: 'Redwing', Aileron;
  }

  .toggle-switch {
    position: relative;
    width: 5vmin;
    height: 2.6vmin;
    background: hsl(240, 10%, 15%);
    border: 0.1vmin solid hsl(0, 0%, 25%);
    border-radius: 1.3vmin;
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
      0 0 1vmin hsla(20, 95%, 51%, 0.4),
      inset 0 0.1vmin 0.2vmin hsla(0, 0%, 100%, 0.2);
  }

  .toggle-slider {
    position: absolute;
    top: 0.3vmin;
    left: 0.3vmin;
    width: 2vmin;
    height: 2vmin;
    background: hsl(0, 0%, 70%);
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0.2vmin 0.4vmin hsla(0, 0%, 0%, 0.3);
  }

  .toggle-switch.active .toggle-slider {
    transform: translateX(2.4vmin);
    background: hsl(0, 0%, 100%);
    box-shadow: 
      0 0.2vmin 0.6vmin hsla(0, 0%, 0%, 0.4),
      0 0 0.8vmin hsla(20, 95%, 51%, 0.6);
  }

  .toggle-switch:hover .toggle-slider {
    box-shadow: 0 0.3vmin 0.6vmin hsla(0, 0%, 0%, 0.4);
  }

  .toggle-switch.active:hover .toggle-slider {
    box-shadow: 
      0 0.3vmin 0.8vmin hsla(0, 0%, 0%, 0.5),
      0 0 1.2vmin hsla(20, 95%, 51%, 0.8);
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
      transform: translateY(4vmin) scale(0.95);
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
      transform: translateY(4vmin) scale(0.95);
    }
  }

  @media (max-width: 1024px), (any-pointer: coarse) {
    .customize-container {
      bottom: max(1rem, env(safe-area-inset-bottom));
      right: 1rem;
    }

    .customize-button {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 1rem;
    }

    .pen-icon {
      width: 1.4rem;
      height: 1.4rem;
    }

    .menu-content {
      width: min(32rem, calc(100vw - 1.5rem));
      max-width: min(32rem, calc(100vw - 1.5rem));
      max-height: min(75vh, 42rem);
      border-radius: 1.25rem;
    }

    .menu-header {
      padding: 1rem 1.25rem;
    }

    .menu-body {
      padding: 1.25rem;
    }

    .menu-header h2 {
      font-size: 1.6rem;
    }

    .edit-close-button {
      width: 3rem;
      height: 3rem;
      font-size: 1.5rem;
      border-radius: 0.85rem;
    }

    .settings-title {
      font-size: 1.15rem;
      margin-bottom: 1rem;
    }

    .setting-group {
      margin-bottom: 1rem;
    }

    .setting-label {
      font-size: 1rem;
      gap: 1rem;
    }

    .setting-control {
      gap: 0.75rem;
    }

    .control-btn {
      width: 2.75rem;
      height: 2.75rem;
      font-size: 1.5rem;
      border-radius: 0.75rem;
    }

    .control-value {
      font-size: 1rem;
      min-width: 1.5rem;
    }

    .info-text {
      font-size: 0.9rem;
    }

    .toggle-switch {
      width: 3.5rem;
      height: 2rem;
      border-radius: 999px;
    }

    .toggle-slider {
      top: 0.2rem;
      left: 0.2rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .toggle-switch.active .toggle-slider {
      transform: translateX(1.5rem);
    }
  }

  @media (max-width: 640px) {
    .customize-container {
      right: 0.75rem;
      bottom: max(0.75rem, env(safe-area-inset-bottom));
    }

    .menu-content {
      width: calc(100vw - 1rem);
      max-height: calc(100vh - 1rem - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    }

    .menu-header,
    .menu-body {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .setting-label {
      flex-direction: column;
      align-items: flex-start;
    }

    .setting-control {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
