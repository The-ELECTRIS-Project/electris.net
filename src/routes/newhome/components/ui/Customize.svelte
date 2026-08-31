<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';
  import { modsState } from '$lib/state/mods.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';

  let isMenuOpen = $state(false);
  let isClosing = $state(false);
  let buttonElement: HTMLButtonElement | undefined = $state();
  
  let gridCols = $derived(modsState.config.newHome.gridCols);
  let gridRows = $derived(modsState.config.newHome.gridRows);
  let openLinksInNewTabs = $derived(modsState.config.newHome.openLinksInNewTabs);
  let showQuickPins = $derived(modsState.config.newHome.showQuickPins);
  let showSearchBar = $derived(modsState.config.newHome.showSearchBar);

  useHoverConfig([
    {
      selectors: ['.customize-button'],
      className: 'hovered-customize-button',
      lockPosition: true,
      color: 'var(--text-on-accent)',
      dynamicSizeOffset: 0.2,
      dynamicBorderRadiusOffset: 0.2
    },
    {
      selectors: ['.edit-close-button', '.control-btn'],
      className: 'hovered-customize-button',
      lockPosition: true,
      color: 'var(--accent)',
      dynamicSizeOffset: 0.2,
      dynamicBorderRadiusOffset: 0.2
    },
    {
      selectors: ['.toggle-switch'],
      className: 'hovered-customize-toggle',
      lockPosition: true,
      color: 'var(--accent)',
      dynamicSizeOffset: 1.2,
      dynamicBorderRadiusOffset: 0.5
    },
    {
      type: ['h3'],
      selectors: ['.settings-title'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        sentences: true
      }
    }
  ]);
  
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
      modsState.updateSetting('newHome', 'gridCols', newCols);
    }
  }

  function updateRows(delta: number) {
    const newRows = gridRows + delta;
    if (newRows >= MIN_ROWS && newRows <= MAX_ROWS) {
      modsState.updateSetting('newHome', 'gridRows', newRows);
    }
  }

  function toggleLinksInNewTabs() {
    modsState.updateSetting('newHome', 'openLinksInNewTabs', !openLinksInNewTabs);
  }

  function toggleQuickPins() {
    modsState.updateSetting('newHome', 'showQuickPins', !showQuickPins);
  }

  function toggleSearchBar() {
    modsState.updateSetting('newHome', 'showSearchBar', !showSearchBar);
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
  <button bind:this={buttonElement} class="customize-button" onclick={toggleMenu} class:active={isMenuOpen} aria-label={t('newhome.customize.open', 'Customisation menu')}>
    <img src="/icons/buttons/pen.svg" alt={t('newhome.customize.title', 'Customise')} class="pen-icon" />
  </button>

  {#if isMenuOpen}
    <div 
      class="menu-overlay" 
      role="button"
      tabindex="0"
      class:closing={isClosing}
      onclick={handleOverlayClick}
      onkeydown={(e) => e.key === 'Escape' && handleOverlayClick(e)}
      aria-label={t('newhome.customize.close', 'Close the menu')}
    >
      <div class="menu-content" class:closing={isClosing}>
        <div class="menu-header">
          <h2>{t('newhome.customize.title', 'Customise')}</h2>
          <button 
            class="edit-close-button" 
            onclick={closeMenu}
            aria-label={t('newhome.customize.close', 'Close the menu')}
          >
            ×
          </button>
        </div>
        <div class="menu-body">
          <div class="settings-section">
            <h3 class="settings-title">{t('newhome.customize.display', 'Display Options')}</h3>
            
            <div class="setting-group">
              <div class="setting-row">
                <label class="setting-label">
                  {t('newhome.customize.newtabs', 'Open Links in New Tabs')}
                  <button 
                    class="toggle-switch" 
                    class:active={openLinksInNewTabs}
                    onclick={toggleLinksInNewTabs}
                    aria-label={t('newhome.customize.newtabs', 'Open Links in New Tabs')}
                  >
                    <span class="toggle-slider"></span>
                  </button>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-row">
                <label class="setting-label">
                  {t('newhome.customize.pins', 'Show Quick Pins')}
                  <button 
                    class="toggle-switch" 
                    class:active={showQuickPins}
                    onclick={toggleQuickPins}
                    aria-label={t('newhome.customize.pins', 'Show Quick Pins')}
                  >
                    <span class="toggle-slider"></span>
                  </button>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-row">
                <label class="setting-label">
                  {t('newhome.customize.search', 'Show Search Bar')}
                  <button 
                    class="toggle-switch" 
                    class:active={showSearchBar}
                    onclick={toggleSearchBar}
                    aria-label={t('newhome.customize.search', 'Show Search Bar')}
                  >
                    <span class="toggle-slider"></span>
                  </button>
                </label>
              </div>
            </div>
          </div>

          {#if modsState.config.newHome.showQuickPins}
            <div class="settings-section">
              <h3 class="settings-title">{t('newhome.customize.grid', 'Grid Layout')}</h3>
              
              <div class="setting-group">
                <div class="setting-row">
                  <label class="setting-label">
                    {t('newhome.customize.columns', 'Columns')}
                    <div class="setting-control">
                      <button 
                        class="control-btn"
                        onclick={() => updateCols(-1)}
                        disabled={gridCols <= MIN_COLS}
                        aria-label={t('newhome.customize.columns.decrease', 'One column fewer')}
                      >
                        −
                      </button>
                      <span class="control-value">{gridCols}</span>
                      <button 
                        class="control-btn"
                        onclick={() => updateCols(1)}
                        disabled={gridCols >= MAX_COLS}
                        aria-label={t('newhome.customize.columns.increase', 'One column more')}
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
                    {t('newhome.customize.rows', 'Rows')}
                    <div class="setting-control">
                      <button 
                        class="control-btn"
                        onclick={() => updateRows(-1)}
                        disabled={gridRows <= MIN_ROWS}
                        aria-label={t('newhome.customize.rows.decrease', 'One row fewer')}
                      >
                        −
                      </button>
                      <span class="control-value">{gridRows}</span>
                      <button 
                        class="control-btn"
                        onclick={() => updateRows(1)}
                        disabled={gridRows >= MAX_ROWS}
                        aria-label={t('newhome.customize.rows.increase', 'One row more')}
                      >
                        +
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <div class="grid-info">
                <span class="info-text">{gridCols * gridRows} {t('newhome.customize.total', 'pins in total')}</span>
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
    bottom: var(--space-5);
    right: var(--space-5);
    z-index: var(--z-sticky);
  }

  .customize-button {
    width: 3rem;
    height: 3rem;
    background: var(--accent);
    border: 1px solid var(--accent-hover);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
    box-shadow: var(--shadow-sm);
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
      color-mix(in srgb, var(--text-on-accent) 20%, transparent),
      transparent
    );
    transition: left var(--duration-slow) var(--ease-out);
  }

  .customize-button:hover {
    transform: translateY(-0.15rem);
    background: var(--accent-hover);
    box-shadow: var(--shadow-md);
  }

  .customize-button:hover::before {
    left: 100%;
  }

  .customize-button:active {
    transform: translateY(-0.05rem) scale(0.98);
  }

  .customize-button.active {
    background: color-mix(in srgb, var(--accent) 85%, black);
    transform: translateY(-0.05rem);
  }

  .pen-icon {
    width: 1.35rem;
    height: 1.35rem;
    transform: rotate(15deg);
    transition: transform var(--duration-slow) var(--ease-out);
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
    inset: 0;
    background: var(--scrim-page);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn var(--duration-slow) var(--ease-in-out);
    z-index: var(--z-popup);
  }

  .menu-overlay.closing {
    animation: fadeOut var(--duration-slow) var(--ease-in-out);
  }

  .menu-content {
    width: min(59rem, calc(100vw - var(--space-6)));
    max-height: min(80vh, 59rem);
    background: var(--surface-raised);
    border: 1px solid var(--accent);
    border-radius: var(--radius-xl);
    box-shadow:
      var(--shadow-lg),
      0 0 var(--space-6) color-mix(in srgb, var(--accent) 30%, transparent);
    animation: slideUp var(--duration-slow) var(--ease-in-out);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .menu-content.closing {
    animation: slideDown var(--duration-slow) var(--ease-in-out);
  }

  .menu-header {
    padding: var(--space-5) var(--space-8);
    border-bottom: 1px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: color-mix(in srgb, var(--accent) 6%, var(--surface-raised));
  }

  .menu-header h2 {
    margin: 0;
    font-size: var(--text-2xl);
    font-family: var(--font-display);
    color: var(--accent-hover);
    text-shadow: 0 0 var(--space-2) color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .edit-close-button {
    width: 3rem;
    height: 3rem;
    background: transparent;
    border: 1px solid var(--text-muted);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: var(--text-xl);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out);
  }

  .edit-close-button:hover {
    background: var(--status-negative);
    border-color: var(--status-negative);
    color: var(--text-on-accent);
    transform: scale(1.05);
  }

  .menu-body {
    flex: 1;
    padding: var(--space-6) var(--space-8);
    overflow-y: auto;
  }

  .settings-section {
    max-width: 100%;
    margin-bottom: var(--space-6);
  }

  .settings-section:last-child {
    margin-bottom: 0;
  }

  .settings-title {
    font-size: var(--text-lg);
    font-family: var(--font-body);
    color: var(--text-secondary);
    margin: 0 0 var(--space-6) 0;
    font-weight: 500;
  }

  .setting-group {
    margin-bottom: var(--space-5);
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
    font-size: var(--text-md);
    color: var(--text-secondary);
    font-family: var(--font-body);
    font-weight: 400;
  }

  .setting-control {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .control-btn {
    width: var(--touch-target-size);
    height: var(--touch-target-size);
    background: color-mix(in srgb, var(--text-secondary) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: var(--text-xl);
    font-weight: normal;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      var(--transition-colors),
      transform var(--duration-fast) var(--ease-out);
    font-family: var(--font-body);
  }

  .control-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--text-secondary) 12%, transparent);
    border-color: var(--accent);
    color: var(--accent-hover);
  }

  .control-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .control-btn:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  .control-value {
    font-size: var(--text-md);
    font-weight: 500;
    color: var(--text-secondary);
    min-width: var(--space-6);
    text-align: center;
    font-family: var(--font-body);
  }

  .grid-info {
    margin-top: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);
  }

  .info-text {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-family: var(--font-body);
  }

  .toggle-switch {
    position: relative;
    width: 3.5rem;
    height: 2rem;
    background: color-mix(in srgb, var(--text-secondary) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: var(--transition-colors);
    overflow: hidden;
  }

  .toggle-switch::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      color-mix(in srgb, var(--accent) 10%, transparent) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity var(--duration-slow) var(--ease-out);
  }

  .toggle-switch:hover::before {
    opacity: 1;
  }

  .toggle-switch.active {
    background: var(--accent);
    border-color: var(--accent-hover);
    box-shadow: 0 0 var(--space-2) color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .toggle-slider {
    position: absolute;
    top: 0.2rem;
    left: 0.2rem;
    width: 1.5rem;
    height: 1.5rem;
    background: var(--text-muted);
    border-radius: var(--radius-round);
    transition:
      var(--transition-colors),
      transform var(--duration-slow) var(--ease-in-out),
      box-shadow var(--duration-slow) var(--ease-in-out);
    box-shadow: var(--shadow-sm);
  }

  .toggle-switch.active .toggle-slider {
    transform: translateX(1.5rem);
    background: var(--text-on-accent);
    box-shadow: var(--shadow-md);
  }

  .toggle-switch:hover .toggle-slider,
  .toggle-switch.active:hover .toggle-slider {
    box-shadow: var(--shadow-md);
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
      transform: translateY(3rem) scale(0.95);
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
      transform: translateY(3rem) scale(0.95);
    }
  }

  @media (max-width: 1024px), (any-pointer: coarse) {
    .customize-container {
      bottom: max(var(--space-4), env(safe-area-inset-bottom));
      right: var(--space-4);
    }

    .customize-button {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: var(--radius-lg);
    }

    .pen-icon {
      width: 1.4rem;
      height: 1.4rem;
    }

    .menu-content {
      width: min(32rem, calc(100vw - var(--space-5)));
      max-height: min(75vh, 42rem);
      border-radius: var(--radius-lg);
    }

    .menu-header {
      padding: var(--space-4) var(--space-5);
    }

    .menu-body {
      padding: var(--space-5);
    }

    .menu-header h2 {
      font-size: var(--text-xl);
    }

    .edit-close-button {
      width: var(--touch-target-size);
      height: var(--touch-target-size);
    }

    .settings-title {
      margin-bottom: var(--space-4);
    }

    .setting-group {
      margin-bottom: var(--space-4);
    }

    .setting-label {
      gap: var(--space-4);
    }
  }

  @media (max-width: 640px) {
    .customize-container {
      right: var(--space-3);
      bottom: max(var(--space-3), env(safe-area-inset-bottom));
    }

    .menu-content {
      width: calc(100vw - var(--space-4));
      max-height: calc(100vh - var(--space-4) - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    }

    .menu-header,
    .menu-body {
      padding-left: var(--space-4);
      padding-right: var(--space-4);
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
