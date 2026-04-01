<script lang="ts">
  import { onMount } from 'svelte';
  import { t, i18nState } from '$lib/stores/i18n.svelte';
  import { browser } from '$app/environment';
  import { useHoverConfig, type HoverConfig } from '$lib/stores/hoverConfig.svelte';
  import { modsState } from '$lib/stores/customization.svelte';

  let isPageArabic = $derived(i18nState.currentLocale === 'ar');
  let gridCols = $derived(modsState.config.gridCols);
  let gridRows = $derived(modsState.config.gridRows);
  let openLinksInNewTabs = $derived(modsState.config.openLinksInNewTabs);

  let pins: Array<{ url: string; title: string; domain: string }> = $state([]);

  let editingPinIndex = $state(-1);
  let editUrl = $state('');
  let editTitle = $state('');

  function getPinSize(rows: number): number {
    if (rows === 1) return 15;
    if (rows === 2) return 12.5;
    if (rows === 3) return 10.5;
    return 12.5;
  }

  let basePinSize = $derived(getPinSize(gridRows));
  let hoverPinSize = $derived(basePinSize + 0.9);

  $effect(() => {
    if (browser) {
      document.documentElement.style.setProperty('--hover-pin-size', `${hoverPinSize}vmin`);
    }
  });

  const hoverConfigs: HoverConfig[] = [
    {
      selectors: ['.pin-card'],
      className: 'hovered-pin',
      requireAllSelectors: false,
      lockPosition: true,
      trackingTarget: '.pin-link'
    }
  ];

  useHoverConfig(hoverConfigs);

  let totalPins = $derived(gridCols * gridRows);
  let gridWidth = $derived((gridCols * basePinSize) + ((gridCols - 1) * 1.6));
  
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
      
      const handleModsChanged = (event: CustomEvent) => {
        const config = event.detail;
        // We don't strictly need to check gridCols/gridRows here if we react to totalPins
        // but we'll keep the save logic for when layout changes.
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

  function cancelEditing() {
    const pinCard = document.querySelector(`[data-pin-index="${editingPinIndex}"]`);
    if (pinCard) {
      pinCard.classList.add('pin-edit-exit');
      setTimeout(() => {
        editingPinIndex = -1;
        editUrl = '';
        editTitle = '';
      }, 250);
    } else {
      editingPinIndex = -1;
      editUrl = '';
      editTitle = '';
    }
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
    
    const pinCard = document.querySelector(`[data-pin-index="${editingPinIndex}"]`);
    if (pinCard) {
      pinCard.classList.add('pin-edit-exit');
      setTimeout(() => {
        editingPinIndex = -1;
        editUrl = '';
        editTitle = '';
      }, 250);
    } else {
      cancelEditing();
    }
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

<div class="pins-section" style="max-width: {gridWidth}vmin;">
  <div 
    class="pins-grid" 
    class:arabic-layout={isPageArabic}
    style="grid-template-columns: repeat({gridCols}, 1fr); width: {gridWidth}vmin;"
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
    max-width: 68vmin;
    position: relative;
    z-index: 2;
  }

  .pin-gear {
    position: relative;
    width: 1.5vmin;
    height: 1.5vmin;
  }

  .pin-trash {
    position: relative;
    width: 1.5vmin;
    height: 1.5vmin;
  }
  
  .pins-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }

  .pins-grid.arabic-layout {
    direction: rtl;
  }

  .pin-card {
    aspect-ratio: 1;
    border-radius: 1vmin;
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
    border: 0.3vmin dashed rgba(246, 89, 1, 0.3);
    border-radius: 1vmin;
    transition: all 0.3s ease;
    background: transparent;
    cursor: pointer;
    font-family: 'Redwing', sans-serif;
    color: inherit;
  }

  .pin-card.empty:hover .pin-empty {
    border-color: rgba(246, 89, 1, 0.6);
    background: rgba(246, 89, 1, 0.05);
  }

  .pin-card.editing {
    border: 0.2vmin solid rgba(246, 89, 1, 0.6);
    border-radius: 1vmin;
    background: rgba(246, 89, 1, 0.1);
    animation: pin-edit-appear 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes pin-edit-appear {
    0% {
      transform: scale(0.8) rotateY(-15deg);
      opacity: 0;
      filter: blur(0.8vmin);
    }
    50% {
      transform: scale(1.05) rotateY(5deg);
      opacity: 0.8;
      filter: blur(0.2vmin);
    }
    100% {
      transform: scale(1) rotateY(0deg);
      opacity: 1;
      filter: blur(0vmin);
    }
  }

  @keyframes pin-edit-disappear {
    0% {
      transform: scale(1) rotateY(0deg);
      opacity: 1;
      filter: blur(0vmin);
    }
    50% {
      transform: scale(1.05) rotateY(-5deg);
      opacity: 0.6;
      filter: blur(0.2vmin);
    }
    100% {
      transform: scale(0.8) rotateY(15deg);
      opacity: 0;
      filter: blur(0.8vmin);
    }
  }

  .pin-edit {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.8rem;
    position: relative;
    animation: pin-edit-content 0.3s ease-out 0.1s both;
  }

  @keyframes pin-edit-content {
    0% {
      transform: translateY(10px);
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
    padding: 0.5rem;
    border: 0.1vmin solid rgba(246, 89, 1, 0.3);
    border-radius: 0.6vmin;
    background: rgba(246, 89, 1, 0.05);
    color: inherit;
    font-family: 'Redwing', sans-serif;
    font-size: 0.8rem;
    outline: none;
  }

  .pin-edit-url:focus,
  .pin-edit-title:focus {
    border-color: rgba(246, 89, 1, 0.6);
    background: rgba(246, 89, 1, 0.1);
  }

  .pin-edit-url::placeholder,
  .pin-edit-title::placeholder {
    color: rgba(246, 89, 1, 0.5);
  }

  .pin-edit-actions {
    display: flex;
    gap: 0.3rem;
    margin-top: auto;
  }

  .pin-save-btn,
  .pin-cancel-btn {
    flex: 1;
    padding: 0.4rem;
    border: 0.1vmin solid rgba(246, 89, 1, 0.3);
    border-radius: 0.4vmin;
    background: rgba(246, 89, 1, 0.1);
    color: inherit;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }

  .pin-save-btn:hover {
    background: rgba(76, 175, 80, 0.2);
    border-color: rgba(76, 175, 80, 0.5);
  }

  .pin-cancel-btn:hover {
    background: rgba(244, 67, 54, 0.2);
    border-color: rgba(244, 67, 54, 0.5);
  }

  .pin-edit-trigger,
  .pin-delete-trigger {
    position: absolute;
    top: 0.3rem;
    background: rgba(246, 89, 1, 0.2);
    border: 0.1vmin solid rgba(246, 89, 1, 0.3);
    border-radius: 0.4vmin;
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 20;
    backdrop-filter: blur(0.5vmin);
  }

  .pin-edit-trigger {
    right: 2.2rem;
  }

  .pin-delete-trigger {
    right: 0.3rem;
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
    background: rgba(255, 154, 59, 0.4);
    border-color: rgba(255, 117, 38, 0.349);
  }

  .pin-delete-trigger:hover {
    background: rgba(244, 67, 54, 0.3);
    border-color: rgba(244, 67, 54, 0.5);
  }

  .empty-icon {
    font-size: 2rem;
    opacity: 0.5;
    margin-bottom: 0.5rem;
  }

  .empty-text {
    font-size: 0.8rem;
    opacity: 0.6;
    font-family: 'Redwing', sans-serif;
  }
  
  .pin-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 1rem;
    border: 0.2vmin solid rgba(246, 89, 1, 0.2);
    border-radius: 1vmin;
    background: rgba(246, 89, 1, 0.05);
    backdrop-filter: blur(1vmin);
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }
  
  .pin-link:hover {
    transform: translateY(-0.3vmin);
    border-color: rgba(246, 89, 1, 0.5);
    background: rgba(246, 89, 1, 0.1);
    box-shadow: 0 0.8vmin 2.2vmin rgba(246, 89, 1, 0.15);
  }

  .pin-card:hover .pin-link {
    transform: translateY(-0.3vmin);
    border-color: rgba(246, 89, 1, 0.5);
    background: rgba(246, 89, 1, 0.1);
    box-shadow: 0 0.8vmin 2.2vmin rgba(246, 89, 1, 0.15);
  }

  .pin-card:hover .pin-glow {
    opacity: 1;
  }

  .pin-favicon {
    width: 3vmin;
    height: 3vmin;
    margin-bottom: 0.5rem;
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
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
    font-family: 'Redwing', sans-serif;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .pin-domain {
    font-size: 0.7rem;
    opacity: 0.6;
    font-family: 'Redwing', sans-serif;
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
    background: radial-gradient(circle, rgba(246, 89, 1, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
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
      gap: 0.85rem;
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
      border-radius: 1rem;
    }

    .pin-link {
      padding: 1rem;
    }

    .pin-favicon {
      width: 2.5rem;
      height: 2.5rem;
      margin-bottom: 0.75rem;
    }

    .pin-title {
      font-size: 1rem;
    }

    .pin-domain,
    .empty-text,
    .pin-edit-url,
    .pin-edit-title {
      font-size: 0.9rem;
    }

    .empty-icon {
      font-size: 2.25rem;
    }

    .pin-save-btn,
    .pin-cancel-btn,
    .pin-edit-trigger,
    .pin-delete-trigger {
      min-height: 2.5rem;
    }

    .pin-edit-trigger,
    .pin-delete-trigger {
      opacity: 1;
      padding: 0.35rem 0.55rem;
    }

    .pin-edit-trigger {
      right: 2.8rem;
    }

    .pin-gear,
    .pin-trash {
      width: 1rem;
      height: 1rem;
    }
  }
</style>
