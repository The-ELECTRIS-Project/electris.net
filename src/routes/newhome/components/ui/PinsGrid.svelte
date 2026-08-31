<script lang="ts">
  import { onMount } from 'svelte';
  import { t, i18nState } from '$lib/state/i18n.svelte';
  import { browser } from '$app/environment';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import { modsState } from '$lib/state/mods.svelte';

  let isPageArabic = $derived(i18nState.currentLocale === 'ar');
  let gridCols = $derived(modsState.config.newHome.gridCols);
  let gridRows = $derived(modsState.config.newHome.gridRows);
  let openLinksInNewTabs = $derived(modsState.config.newHome.openLinksInNewTabs);

  let pins: Array<{ url: string; title: string; domain: string }> = $state([]);

  let editingPinIndex = $state(-1);
  let editUrl = $state('');
  let editTitle = $state('');

  // Every measurement here is in rem, so the grid and the text inside it scale together.
  const PIN_GAP = 1;

  function getPinSize(rows: number): number {
    if (rows === 1) return 11;
    if (rows === 2) return 9.25;
    if (rows === 3) return 7.75;
    return 9.25;
  }

  let basePinSize = $derived(getPinSize(gridRows));
  let hoverPinSize = $derived(basePinSize + 0.65);

  $effect(() => {
    if (browser) {
      document.documentElement.style.setProperty('--hover-pin-size', `${hoverPinSize}rem`);
    }
  });

  useHoverConfig([
    {
      selectors: {
        include: ['.pin-card'],
        exclude: ['.pin-card.empty']
      },
      className: 'hovered-pin',
      requireAllSelectors: false,
      lockPosition: true,
      trackingTarget: '.pin-link',
      dynamicSizeOffset: 0.5,
      dynamicBorderRadiusOffset: 0.2,
      positionOffset: {
        x: 0.01,
        y: -0.03
      }
    },
    {
      selectors: {
        include: ['.pin-card.empty']
      },
      className: 'hovered-pin',
      requireAllSelectors: false,
      lockPosition: true,
      trackingTarget: '.pin-link',
      dynamicSizeOffset: {
        width: 0.5,
        height: 0.8
      },
      dynamicBorderRadiusOffset: 0.25,
      positionOffset: {
        x: -0.01,
        y: -0.03
      }
    }
  ]);

  let totalPins = $derived(gridCols * gridRows);
  let gridWidth = $derived((gridCols * basePinSize) + ((gridCols - 1) * PIN_GAP));
  
  $effect(() => {
    if (browser && totalPins > 0) {
      updatePinsArray();
    }
  });

  onMount(() => {
    if (browser) {
      modsState.init();
      
      setTimeout(() => {
        loadPins();
      }, 0);
      
      const handleModsChanged = () => {
        setTimeout(() => {
          savePins();
        }, 0);
      };
      
      window.addEventListener('modsChanged', handleModsChanged as globalThis.EventListener);
      
      return () => {
        window.removeEventListener('modsChanged', handleModsChanged as globalThis.EventListener);
      };
    }
  });

  function updatePinsArray() {
    if (pins.length === totalPins) return;
    
    const currentPins = [...pins];
    const newPins = [];
    
    for (let i = 0; i < totalPins; i++) {
      if (i < currentPins.length && currentPins[i] && currentPins[i].url) {
        newPins[i] = currentPins[i];
      } else {
        newPins[i] = { url: '', title: '', domain: '' };
      }
    }
    pins = newPins;
  }

  function extractDomain(url: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  function loadPins() {
    if (!browser) return;
    
    const savedPins = localStorage.getItem('newhome-pins');
    
    if (savedPins) {
      try {
        const loadedPins = JSON.parse(savedPins);
        const newPins = [];
        
        for (let i = 0; i < totalPins; i++) {
          if (i < loadedPins.length && loadedPins[i] && loadedPins[i].url) {
            newPins[i] = loadedPins[i];
          } else {
            newPins[i] = { url: '', title: '', domain: '' };
          }
        }
        
        pins = newPins;
      } catch (e) {
        console.warn('Failed to load saved pins:', e);
        initializeDefaultPins();
      }
    } else {
      initializeDefaultPins();
    }
  }

  function initializeDefaultPins() {
    const newPins = [];
    for (let i = 0; i < totalPins; i++) {
      newPins[i] = { url: '', title: '', domain: '' };
    }
    newPins[0] = {
      url: 'https://electris.net',
      title: 'ELECTRIS',
      domain: 'electris.net'
    };
    pins = newPins;
    savePins();
  }

  function savePins() {
    if (!browser) return;
    
    try {
      const pinsToSave = JSON.stringify(pins);
      localStorage.setItem('newhome-pins', pinsToSave);
    } catch (e) {
      console.warn('Failed to save pins:', e);
    }
  }

  function startEditingPin(index: number) {
    editingPinIndex = index;
    editUrl = pins[index].url;
    editTitle = pins[index].title;
  }

  // The exit class is added by hand, so it has to be taken off by hand once the card is back.
  function closeEditor() {
    const pinCard = document.querySelector(`[data-pin-index="${editingPinIndex}"]`);

    const reset = () => {
      pinCard?.classList.remove('pin-edit-exit');
      editingPinIndex = -1;
      editUrl = '';
      editTitle = '';
    };

    if (!pinCard) {
      reset();
      return;
    }

    pinCard.addEventListener('animationend', reset, { once: true });
    pinCard.classList.add('pin-edit-exit');
  }

  function cancelEditing() {
    closeEditor();
  }

  function savePin() {
    if (editingPinIndex < 0) return;
    
    let processedUrl = editUrl.trim();
    if (processedUrl && !processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    pins[editingPinIndex] = {
      url: processedUrl,
      title: editTitle.trim() || (processedUrl ? extractDomain(processedUrl) : ''),
      domain: processedUrl ? extractDomain(processedUrl) : ''
    };
    
    savePins();
    closeEditor();
  }

  function deletePin(index: number) {
    pins[index] = { url: '', title: '', domain: '' };
    savePins();
  }

  function handlePinKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      savePin();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  }

  function handleImageError(event: Event) {
    const target = event.target;
    if (target && 'style' in target) {
      (target as HTMLElement).style.display = 'none';
    }
  }
</script>

<div class="pins-section" style="max-width: {gridWidth}rem;">
  <div 
    class="pins-grid" 
    class:arabic-layout={isPageArabic}
    style="grid-template-columns: repeat({gridCols}, 1fr); width: {gridWidth}rem;"
  >
    {#each pins as pin, index}
      <div 
        class="wrap-no-interact-all pin-card" 
        class:empty={!pin.url}
        class:editing={editingPinIndex === index}
        data-pin-index={index}
      >
        {#if editingPinIndex === index}
          <div class="pin-edit">
            <input
              type="text"
              bind:value={editUrl}
              placeholder={t('newhome.pin.edit.url.placeholder', 'Enter URL...')}
              class="pin-edit-url"
              onkeydown={handlePinKeydown}
            />
            <input
              type="text"
              bind:value={editTitle}
              placeholder={t('newhome.pin.edit.title.placeholder', 'Enter title (optional)')}
              class="pin-edit-title"
              onkeydown={handlePinKeydown}
            />
            <div class="pin-edit-actions">
              <button class="pin-save-btn" onclick={savePin} title={t('newhome.pin.edit.save', 'Save')}>
                ✓
              </button>
              <button class="pin-cancel-btn" onclick={cancelEditing} title={t('newhome.pin.edit.cancel', 'Cancel')}>
                ✕
              </button>
            </div>
          </div>
        {:else if pin.url}
          <a 
            href={pin.url}
            class="pin-link"
            target={openLinksInNewTabs ? "_blank" : "_self"}
            rel={openLinksInNewTabs ? "noopener noreferrer" : undefined}
          >
            <div class="pin-favicon">
              <img 
                src="https://icons.duckduckgo.com/ip3/{pin.domain}.ico" 
                alt=""
                loading="lazy"
                onerror={handleImageError}
              />
            </div>
            <div class="pin-info">
              <div class="pin-title">{pin.title}</div>
              <div class="pin-domain">{pin.domain}</div>
            </div>
            <div class="pin-glow"></div>
          </a>
          <button class="pin-edit-trigger" onclick={() => startEditingPin(index)} title={t('newhome.pin.edit.button', 'Edit pin')}>
            <img src="/icons/buttons/gear.svg" class="pin-gear" alt={t('newhome.pin.edit.button', 'Edit')}>
          </button>
          <button class="pin-delete-trigger" onclick={() => deletePin(index)} title={t('newhome.pin.delete.button', 'Delete pin')}>
            <img src="/icons/buttons/bin.svg" class="pin-trash" alt={t('newhome.pin.delete.button', 'Delete')}>
          </button>
        {:else}
          <button class="pin-empty" onclick={() => startEditingPin(index)}>
            <div class="empty-icon">+</div>
            <div class="empty-text">{t('newhome.pin.empty', 'Add Pin')}</div>
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .pins-section {
    width: 100%;
    position: relative;
    z-index: var(--z-raised);
  }

  .pin-gear,
  .pin-trash {
    position: relative;
    width: 1rem;
    height: 1rem;
  }

  .pins-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--space-4);
  }

  .pins-grid.arabic-layout {
    direction: rtl;
  }

  .pin-card {
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    position: relative;
    overflow: visible;
  }

  .pin-card.empty .pin-empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: var(--radius-md);
    transition: var(--transition-colors);
    background: transparent;
    cursor: pointer;
    font-family: var(--font-body);
    color: inherit;
  }

  .pin-card.empty:hover .pin-empty {
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    background: color-mix(in srgb, var(--accent) 5%, transparent);
  }

  .pin-card.editing {
    border: 1px solid color-mix(in srgb, var(--accent) 60%, transparent);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    animation: pin-edit-appear 0.25s var(--ease-spring);
  }

  @keyframes pin-edit-appear {
    0% {
      transform: scale(0.8) rotateY(-15deg);
      opacity: 0;
      filter: blur(8px);
    }
    50% {
      transform: scale(1.05) rotateY(5deg);
      opacity: 0.8;
      filter: blur(2px);
    }
    100% {
      transform: scale(1) rotateY(0deg);
      opacity: 1;
      filter: blur(0);
    }
  }

  /* The class is added from JavaScript, so it cannot carry the scoping hash. */
  .pin-card:global(.pin-edit-exit) {
    animation: pin-edit-disappear 0.25s var(--ease-in-out) forwards;
  }

  @keyframes pin-edit-disappear {
    0% {
      transform: scale(1) rotateY(0deg);
      opacity: 1;
      filter: blur(0);
    }
    50% {
      transform: scale(1.05) rotateY(-5deg);
      opacity: 0.6;
      filter: blur(2px);
    }
    100% {
      transform: scale(0.8) rotateY(15deg);
      opacity: 0;
      filter: blur(8px);
    }
  }

  .pin-edit {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    position: relative;
    animation: pin-edit-content var(--duration-slow) var(--ease-out) 0.1s both;
  }

  @keyframes pin-edit-content {
    0% {
      transform: translateY(0.75rem);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .pin-edit-url,
  .pin-edit-title {
    width: 100%;
    padding: var(--space-2);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--accent) 5%, transparent);
    color: inherit;
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    outline: none;
  }

  .pin-edit-url:focus,
  .pin-edit-title:focus {
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .pin-edit-url::placeholder,
  .pin-edit-title::placeholder {
    color: color-mix(in srgb, var(--accent) 50%, transparent);
  }

  .pin-edit-actions {
    display: flex;
    gap: var(--space-1);
    margin-top: auto;
  }

  .pin-save-btn,
  .pin-cancel-btn {
    flex: 1;
    padding: var(--space-2);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: var(--radius-xs);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: inherit;
    cursor: pointer;
    font-size: var(--text-sm);
    transition: var(--transition-colors);
  }

  .pin-save-btn:hover {
    background: var(--status-positive-bg);
    border-color: var(--status-positive-border);
  }

  .pin-cancel-btn:hover {
    background: var(--status-negative-bg);
    border-color: var(--status-negative-border);
  }

  .pin-edit-trigger,
  .pin-delete-trigger {
    position: absolute;
    top: var(--space-1);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: var(--radius-xs);
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-2xs);
    cursor: pointer;
    opacity: 0;
    transition:
      var(--transition-colors),
      opacity var(--duration-slow) var(--ease-out);
    z-index: var(--z-sticky);
    backdrop-filter: blur(4px);
  }

  .pin-edit-trigger {
    right: 2.2rem;
  }

  .pin-delete-trigger {
    right: var(--space-1);
  }

  .pin-card:hover .pin-edit-trigger,
  .pin-card:hover .pin-delete-trigger {
    opacity: 1;
  }

  .pin-card:focus-within .pin-edit-trigger,
  .pin-card:focus-within .pin-delete-trigger {
    opacity: 1;
  }

  .pin-edit-trigger:hover {
    background: color-mix(in srgb, var(--accent) 40%, transparent);
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  }

  .pin-delete-trigger:hover {
    background: color-mix(in srgb, var(--status-negative) 30%, transparent);
    border-color: color-mix(in srgb, var(--status-negative) 50%, transparent);
  }

  .empty-icon {
    font-size: var(--text-2xl);
    opacity: 0.5;
    margin-bottom: var(--space-2);
  }

  .empty-text {
    font-size: var(--text-2xs);
    opacity: 0.6;
    font-family: var(--font-body);
  }

  .pin-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: var(--space-4);
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--accent) 5%, transparent);
    backdrop-filter: blur(10px);
    text-decoration: none;
    color: inherit;
    transition:
      var(--transition-colors),
      transform var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
    position: relative;
    overflow: hidden;
    z-index: var(--z-raised);
  }

  .pin-link:hover,
  .pin-card:hover .pin-link {
    transform: translateY(-0.2rem);
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    box-shadow: 0 var(--space-2) var(--space-5) color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .pin-card:hover .pin-glow {
    opacity: 1;
  }

  .pin-favicon {
    width: 2.25rem;
    height: 2.25rem;
    margin-bottom: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pin-favicon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .pin-info {
    text-align: center;
    width: 100%;
  }

  .pin-title {
    font-weight: 600;
    font-size: var(--text-sm);
    margin-bottom: var(--space-1);
    font-family: var(--font-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pin-domain {
    font-size: var(--text-2xs);
    opacity: 0.6;
    font-family: var(--font-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pin-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 70%);
    opacity: 0;
    transition: opacity var(--duration-slow) var(--ease-out);
  }

  .pin-link:hover .pin-glow {
    opacity: 1;
  }

  @media (max-width: 900px) {
    .pins-section {
      max-width: 100% !important;
    }

    .pins-grid {
      width: 100% !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 720px) {
    .pins-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 560px) {
    .pins-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: var(--space-3);
    }
  }

  @media (any-pointer: coarse) {
    .pins-section {
      max-width: 100% !important;
    }

    .pins-grid {
      width: 100% !important;
    }

    .pin-link,
    .pin-card.empty .pin-empty,
    .pin-card.editing {
      border-radius: var(--radius-lg);
    }

    .pin-title {
      font-size: var(--text-base);
    }

    .pin-domain,
    .empty-text,
    .pin-edit-url,
    .pin-edit-title {
      font-size: var(--text-sm);
    }

    .pin-save-btn,
    .pin-cancel-btn,
    .pin-edit-trigger,
    .pin-delete-trigger {
      min-height: var(--touch-target-size);
    }

    .pin-edit-trigger,
    .pin-delete-trigger {
      opacity: 1;
      padding: var(--space-1) var(--space-2);
    }

    .pin-edit-trigger {
      right: 2.8rem;
    }
  }
</style>
