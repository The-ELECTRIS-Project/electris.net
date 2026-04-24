<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { afterNavigate } from '$app/navigation';
  import { t } from '$lib/stores/i18n.svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';
  import LanguageSelector from '$lib/UI/utils/LanguageSelector.svelte';
  import { 
    themeState,
    type Theme,
    type ColorScheme,
  } from '$lib/stores/theme.svelte';
  import { 
    environmentState, 
    generateEnvironmentUrl, 
    getEnvironmentDisplayName 
  } from '$lib/utils/environment.svelte';
  import { 
    getCookieCount,
    deleteAllCookies, 
    getLocalStorageCount,
    clearAllLocalStorage,
    resetAllStates,
    getIgnoreExcludedSuffixes,
    setIgnoreExcludedSuffixes
  } from '$lib/utils/devTools';
  import Hamburger from './utils/Hamburger.svelte';

  interface ThemeOption {
    value: Theme;
    label: string;
    icon: string;
    description?: string;
  }

  interface ColorSchemeOption {
    value: ColorScheme;
    label: string;
    icon: string;
    description?: string;
  }

  let showOptions = $state(false);
  let showThemeDropdown = $state(false);
  let showColorSchemeDropdown = $state(false);
  let showCookieConfirmDialog = $state(false);
  let showLocalStorageConfirmDialog = $state(false);
  let showEverythingConfirmDialog = $state(false);
  let showDevToolsSubmenu = $state(false);
  let devToolsSpace: 'site-data' | 'youtube-api' | null = $state(null);
  let ignoreExcludedSuffixes = $state(false);
  let isOpen = $state(false);
  let siteHref = $state("");
  let gearElement: HTMLImageElement | undefined = $state();
  let isHoveringGear = $state(false);
  let animationId: number;
  let currentRotation = 0;
  let targetSpeed = $state(0);
  let currentSpeed = 0;
  let languageSelectorRef: LanguageSelector | undefined = $state();

  // Environment info
  let envInfo = $derived(environmentState.info);
  let footerEnv = $derived(getEnvironmentDisplayName(envInfo.environment));
  let showDevTools = $derived(envInfo.isProduction ? false : (envInfo.isDevelopment || envInfo.isCanary));

  useHoverConfig([
    {
      type: [ 'a' ],
      selectors: ['.menu-item a'],
      className: 'hovered-menu-item',
      lockPosition: true
    },
    {
      selectors: [ '.option' ],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: false,
        sentences: false
      }
    },
    {
      selectors: ['.hamburger-footer', '.footer'],
      className: 'hovered-hamburger-footer',
      requireAllSelectors: false,
      lockPosition: true
    },
    {
      selectors: ['.hamburger-button'],
      className: 'hovered-hamburger',
      lockPosition: true,
    },
    {
      selectors: ['.settings-button'],
      className: 'hovered-settings',
      lockPosition: true,
      customPositioning: {
       targetSelector: '.settings-icon'
      }
    },
    {
      type: [ 'a' ],
      selectors: ['.switch-button'],
      className: 'hovered-word-wrap',
      lockPosition: false,
      wrapText: {
        sentences: true
      }
    },
    {
      type: [ 'a' ],
      selectors: ['.nav-button'],
      className: 'hovered-word-wrap',
      requireAllSelectors: false,
      lockPosition: true,
      wrapText: {
        sentences: true
      }
    }
  ]);

  let themeOptions = $derived([
    { 
      value: 'default' as Theme, 
      label: t('nav.options.theme.electrified', 'Electrified'), 
      icon: '🎨',
      description: t('nav.options.theme.electrified.desc', 'The ELECTRIS Style')
    },
    { 
      value: 'cyber-neotic' as Theme, 
      label: t('nav.options.theme.cyber', 'Cyber-Neotic'), 
      icon: '🧬',
      description: t('nav.options.theme.cyber.desc', 'A neon-lit future')
    }
  ] as ThemeOption[]);

  let colorSchemeOptions = $derived([
    { 
      value: 'auto' as ColorScheme, 
      label: t('nav.options.color.auto', 'Automatic'), 
      icon: '🔄',
      description: t('nav.options.color.auto.desc', 'Follows system')
    },
    { 
      value: 'light' as ColorScheme, 
      label: t('nav.options.color.light', 'Light'), 
      icon: '☀️',
      description: t('nav.options.color.light.desc', 'Clean and bright')
    },
    { 
      value: 'dark' as ColorScheme, 
      label: t('nav.options.color.dark', 'Dark'), 
      icon: '🌙',
      description: t('nav.options.color.dark.desc', 'Easy on the eyes')
    },
    { 
      value: 'midnight' as ColorScheme, 
      label: t('nav.options.color.oled', 'Midnight'), 
      icon: '🌚',
      description: t('nav.options.color.oled.desc', 'Looks like there\'s a blackout...')
    }
  ] as ColorSchemeOption[]);

  let currentThemeInfo = $derived(themeOptions.find(t => t.value === themeState.theme) || themeOptions[0]);
  let currentColorSchemeInfo = $derived(colorSchemeOptions.find(c => c.value === themeState.colorScheme) || colorSchemeOptions[0]);

  let menuItems = $derived([
    { label: t('nav.burger.home', 'Home'), href: '/', newTab: false },
    { label: t('blog.title', 'Blog'), href: '/blog', newTab: false },
    { label: t('nav.burger.social', 'Socials'), href: '/socials', newTab: false },
    { label: t('nav.burger.egs', 'Game Studios'), href: '/egs', newTab: false },
    { label: t('nav.burger.ems', 'Media Studios'), href: '/ems', newTab: false }
  ]);

  $effect(() => {
    let speed = 0;
    if (isHoveringGear) {
      speed += 1;
    }
    if (showOptions) {
      speed += 1;
    }
    targetSpeed = speed;
    startGearAnimation();
  });

  function updateSiteHref() {
    siteHref = generateEnvironmentUrl();
  }

  function animateGear() {
    const speedDiff = targetSpeed - currentSpeed;
    const acceleration = 0.3;
    currentSpeed += speedDiff * acceleration;

    if (Math.abs(speedDiff) < 0.01) {
      currentSpeed = targetSpeed;
    }

    currentRotation += currentSpeed;
    
    if (targetSpeed === 0 && Math.abs(currentSpeed) < 0.1) {
      const nearestFullRotation = Math.round(currentRotation / 360) * 360;
      const rotationDiff = nearestFullRotation - currentRotation;
      
      if (Math.abs(rotationDiff) < 10) {
        currentRotation = nearestFullRotation % 360;
        currentSpeed = 0;
      }
    }

    if (currentRotation >= 360) {
      currentRotation -= 360;
    } else if (currentRotation <= -360) {
      currentRotation += 360;
    }

    if (gearElement) {
      gearElement.style.transform = `rotate(${currentRotation}deg)`;
    }

    if (Math.abs(currentSpeed) > 0.01 || Math.abs(targetSpeed - currentSpeed) > 0.01) {
      animationId = requestAnimationFrame(animateGear);
    }
  }

  function startGearAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    animateGear();
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && (Math.abs(currentSpeed) > 0.01 || Math.abs(targetSpeed - currentSpeed) > 0.01)) {
      startGearAnimation();
    }
  }

  function handleGearHover() {
    isHoveringGear = true;
    startGearAnimation();
  }

  function handleGearLeave() {
    isHoveringGear = false;
    startGearAnimation();
  }

  function closeLanguageDropdown() {
    window.dispatchEvent(new CustomEvent('closeLanguageDropdown'));
  }

  onMount(async () => {
    await environmentState.refresh();
    ignoreExcludedSuffixes = getIgnoreExcludedSuffixes();
    
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      themeState.applyCurrentStyles();
    }
  });

  afterNavigate(() => {
    updateSiteHref();
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });

  function handleClickOutside(event: MouseEvent) {
    if (typeof document === 'undefined') return;
    
    if (showOptions) {
      const optionsMenu = document.querySelector('.options-menu');
      const logoButton = document.querySelector('.settings-button');
      if (
        optionsMenu &&
        !optionsMenu.contains(event.target as Node) &&
        logoButton &&
        !logoButton.contains(event.target as Node)
      ) {
        showOptions = false;
        showThemeDropdown = false;
        showColorSchemeDropdown = false;
        showCookieConfirmDialog = false;
        showLocalStorageConfirmDialog = false;
        showEverythingConfirmDialog = false;
        showDevToolsSubmenu = false;
        devToolsSpace = null;
        startGearAnimation();
      }
    }

    if (showThemeDropdown) {
      const themeSelector = document.querySelector('.theme-selector');
      if (themeSelector && !themeSelector.contains(event.target as Node)) {
        showThemeDropdown = false;
      }
    }

    if (showColorSchemeDropdown) {
      const colorSchemeSelector = document.querySelector('.color-scheme-selector');
      if (colorSchemeSelector && !colorSchemeSelector.contains(event.target as Node)) {
        showColorSchemeDropdown = false;
      }
    }

    if (showDevToolsSubmenu) {
      const devToolsSection = document.querySelector('.devtools-section');
      if (devToolsSection && !devToolsSection.contains(event.target as Node)) {
        showDevToolsSubmenu = false;
      }
    }
  }

  function handleThemeChange(themeValue: Theme) {
    themeState.setTheme(themeValue);
    showThemeDropdown = false;
  }

  function handleColorSchemeChange(colorSchemeValue: ColorScheme) {
    themeState.setColorScheme(colorSchemeValue);
    showColorSchemeDropdown = false;
  }

  function toggleThemeDropdown(event: MouseEvent) {
    event.stopPropagation();

    if (showThemeDropdown === false) {
      closeLanguageDropdown();
      showColorSchemeDropdown = false;
    }
    
    showThemeDropdown = !showThemeDropdown;
  }

  function toggleColorSchemeDropdown(event: MouseEvent) {
    event.stopPropagation();

    if (showColorSchemeDropdown === false) {
      closeLanguageDropdown();
      showThemeDropdown = false;
    }
    
    showColorSchemeDropdown = !showColorSchemeDropdown;
  }

  function handleOptionsToggle(event: MouseEvent) {
    event.stopPropagation();
    showOptions = !showOptions;
    if (!showOptions) {
      showThemeDropdown = false;
      showColorSchemeDropdown = false;
      showCookieConfirmDialog = false;
      showLocalStorageConfirmDialog = false;
      showEverythingConfirmDialog = false;
      showDevToolsSubmenu = false;
      devToolsSpace = null;
    }
    startGearAnimation();
  }

  function toggleDevToolsSubmenu(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    showDevToolsSubmenu = !showDevToolsSubmenu;
  }

  function toggleIgnoreExcludedSuffixes() {
    ignoreExcludedSuffixes = !ignoreExcludedSuffixes;
    setIgnoreExcludedSuffixes(ignoreExcludedSuffixes);
  }

  function handleCookieReset() {
    showCookieConfirmDialog = true;
  }

  function handleLocalStorageReset() {
    showLocalStorageConfirmDialog = true;
  }

  function handleEverythingReset() {
    showEverythingConfirmDialog = true;
  }

  function confirmCookieReset() {
    deleteAllCookies();
    showCookieConfirmDialog = false;
    showOptions = false;
    alert(`Cookies reset complete!`);
    window.location.reload();
  }

  function confirmLocalStorageReset() {
    clearAllLocalStorage();
    showLocalStorageConfirmDialog = false;
    showOptions = false;
    alert(`LocalStorage reset complete!`);
    window.location.reload();
  }

  function confirmEverythingReset() {
    resetAllStates();
    showEverythingConfirmDialog = false;
    showOptions = false;
    alert(`Everything has been reset!`);
    window.location.reload();
  }

  function cancelCookieReset() {
    showCookieConfirmDialog = false;
  }

  function cancelLocalStorageReset() {
    showLocalStorageConfirmDialog = false;
  }

  function cancelEverythingReset() {
    showEverythingConfirmDialog = false;
  }
</script>

<nav class="navbar">
  <div class="nav-buttons">
    <a class="nav-button abt" href="/about">{t('about.hero', 'About Us')}</a>
    <a class="nav-button elts" href="/">{t('site.title', 'ELECTRIS')}</a>
    <a class="nav-button proj" href="/projects">{t('nav.bar.proj', 'Projects')}</a>
  </div>
  <Hamburger {isOpen} onToggle={() => isOpen = !isOpen} />
  {#if isOpen}
    <div class="overlay" role="button" tabindex="0" onclick={() => isOpen = false} onkeydown={(e) => e.key === 'Escape' && (isOpen = false)} transition:fade={{ duration: 200 }} aria-label="Close Menu"></div>
  {/if}
  <button
    type="button"
    class="settings-button"
    onclick={handleOptionsToggle}
    onmouseenter={handleGearHover}
    onmouseleave={handleGearLeave}>
    <img 
      bind:this={gearElement}
      class="settings-icon" 
      src='/icons/buttons/gear.svg' 
      alt='Options' 
    />
  </button>
  <div class="hamburger {isOpen ? 'open' : ''}">
    <div class="hamburger-content">
      {#each menuItems as item}
        <div class="menu-item">
          <a
            href={item.href}
            target={item.newTab ? "_blank" : null}
            onclick={() => isOpen = false}>
            {item.label}
          </a>
        </div>
      {/each}
    </div>
      <div class="wrap-no-interact-all hamburger-footer" role="region"
        onmouseenter={(e: MouseEvent) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          window.dispatchEvent(new CustomEvent('footerHovered', { detail: { x: centerX, y: centerY } }));
        }}
        onmouseleave={() => {
          window.dispatchEvent(new CustomEvent('footerUnhovered'));
        }}>
        <div class="footer">
          <p><u>{t('site.title', 'ELECTRIS')} &#169;2025</u></p>
          <a href="https://github.com/The-ELECTRIS-Project/electris.net" target="_blank"><u>{envInfo.siteVersion}</u></a>
          <span class="env-indicator">{footerEnv}</span>
        </div>
      </div>
  </div>
</nav>

{#if showOptions}
  <div class="options-menu" transition:fade={{ duration: 200 }}>
    <div transition:slide={{ duration: 300 }}>
      <h2>{t('nav.options', 'Options')}</h2>
      
      <div class="option">
        <span>{t('nav.options.theme', 'Theme')}</span>
          <div class="selector">
            <button 
              type="button" 
              class="theme-button"
              onclick={toggleThemeDropdown}
              aria-expanded={showThemeDropdown}
              aria-haspopup="listbox"
            >
              <span class="wrap-no-interact theme-icon">{currentThemeInfo.icon}</span>
              <span class="theme-name">{currentThemeInfo.label}</span>
              <span class="dropdown-arrow" class:open={showThemeDropdown}>▼</span>
            </button>
            
            {#if showThemeDropdown}
              <div class="theme-dropdown" transition:slide={{ duration: 200 }} role="listbox">
                {#each themeOptions as themeOption}
                  <button
                    type="button"
                    class="theme-option"
                    class:active={themeState.theme === themeOption.value}
                    onclick={() => handleThemeChange(themeOption.value)}
                    role="option"
                    aria-selected={themeState.theme === themeOption.value}
                    title={themeOption.description}
                  >
                    <span class="wrap-no-interact">{themeOption.icon}</span>
                    <div class="theme-info">
                      <span class="theme-name">{themeOption.label}</span>
                      {#if themeOption.description}
                        <span class="theme-description">{themeOption.description}</span>
                      {/if}
                    </div>
                    {#if themeState.theme === themeOption.value}
                      <span class="checkmark">✓</span>
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
      </div>

      <!-- Color Scheme Selector -->
      <div class="option">
        <span>{t('nav.options.color', 'Color')}</span>
        <div class="selector">
          <button 
            type="button" 
            class="color-scheme-button"
            onclick={toggleColorSchemeDropdown}
            aria-expanded={showColorSchemeDropdown}
            aria-haspopup="listbox"
          >
            <span class="color-scheme-icon">{currentColorSchemeInfo.icon}</span>
            <span class="color-scheme-name">{currentColorSchemeInfo.label}</span>
            <span class="dropdown-arrow" class:open={showColorSchemeDropdown}>▼</span>
          </button>
          
          {#if showColorSchemeDropdown}
            <div class="color-scheme-dropdown" transition:slide={{ duration: 200 }} role="listbox">
              {#each colorSchemeOptions as colorOption}
                <button
                  type="button"
                  class="color-scheme-option"
                  class:active={themeState.colorScheme === colorOption.value}
                  onclick={() => handleColorSchemeChange(colorOption.value)}
                  role="option"
                  aria-selected={themeState.colorScheme === colorOption.value}
                  title={colorOption.description}
                >
                  <span class="wrap-no-interact">{colorOption.icon}</span>
                  <div class="color-scheme-info">
                    <span class="color-scheme-name">{colorOption.label}</span>
                    {#if colorOption.description}
                      <span class="color-scheme-description">{colorOption.description}</span>
                    {/if}
                  </div>
                  {#if themeState.colorScheme === colorOption.value}
                    <span class="checkmark">✓</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="option">
        <span>{t('nav.options.lang', 'Language')}</span>
        <LanguageSelector bind:this={languageSelectorRef} />
      </div>
      {#if showDevTools}
        <div class="devtools-section">
          <div 
            class="devtools-header option"
            onclick={toggleDevToolsSubmenu}
            aria-expanded={showDevToolsSubmenu}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && toggleDevToolsSubmenu(e)}
          >
            <span>{t('devtools.title', 'DevTools')}</span>
            <span class="triangle" class:expanded={showDevToolsSubmenu}>▸</span>
          </div>
          {#if showDevToolsSubmenu}
            <div class="devtools-submenu" transition:slide={{ duration: 300 }}>
              <div class="devtools-workspace-viewport">
                <div
                  class="devtools-panel-track"
                  style="transform: translateX({devToolsSpace ? '-50%' : '0%'})"
                >
                  <!-- Home panel: space list -->
                  <div class="devtools-panel">
                    <button
                      class="devtools-space-item"
                      onclick={() => devToolsSpace = 'site-data'}
                    >
                      <span>🗄️ {t('devtools.space.sitedata', 'Manage Site Data')}</span>
                      <span class="space-chevron">›</span>
                    </button>
                    <button
                      class="devtools-space-item"
                      onclick={() => devToolsSpace = 'youtube-api'}
                    >
                      <span>▶️ {t('devtools.space.ytapi', 'YouTube API')}</span>
                      <span class="space-chevron">›</span>
                    </button>
                  </div>

                  <!-- Sub-panel -->
                  <div class="devtools-panel">
                    {#if devToolsSpace === 'site-data'}
                      <button
                        class="devtools-back"
                        onclick={(e) => { e.stopPropagation(); devToolsSpace = null; }}
                      >
                        {t('devtools.back', 'Back')}
                      </button>
                      <p class="devtools-space-title">🗄️ {t('devtools.space.sitedata', 'Manage Site Data')}</p>
                      <div class="devtools-option">
                        <span>{t('devtools.reset.cookies', 'Reset Cookies')}</span>
                        <button
                          type="button"
                          class="reset-button"
                          onclick={handleCookieReset}
                          title="Reset all cookies"
                        >
                          🍪 {t('devtools.reset', 'Reset')}
                        </button>
                      </div>
                      <div class="devtools-option">
                        <span>{t('devtools.reset.localstorage', 'Reset LocalStorage')}</span>
                        <button
                          type="button"
                          class="reset-button"
                          onclick={handleLocalStorageReset}
                          title="Reset all LocalStorage data"
                        >
                          💾 {t('devtools.reset', 'Reset')}
                        </button>
                      </div>
                      <div class="devtools-option">
                        <span>{t('devtools.reset.everything', 'Reset Everything')}</span>
                        <button
                          type="button"
                          class="reset-button"
                          onclick={handleEverythingReset}
                          title="Reset all cookies and LocalStorage"
                        >
                          🧨 {t('devtools.reset', 'Reset')}
                        </button>
                      </div>
                    {:else if devToolsSpace === 'youtube-api'}
                      <button
                        class="devtools-back"
                        onclick={(e) => { e.stopPropagation(); devToolsSpace = null; }}
                      >
                        ‹ {t('devtools.back', 'Back')}
                      </button>
                      <p class="devtools-space-title">▶️ {t('devtools.space.ytapi', 'YouTube API')}</p>
                      <div class="devtools-option">
                        <span>{t('devtools.ignore.suffixes', 'Ignore Excluded Suffixes')}</span>
                        <button
                          class="toggle-switch-mini"
                          class:active={ignoreExcludedSuffixes}
                          onclick={toggleIgnoreExcludedSuffixes}
                          aria-label="Toggle ignore excluded suffixes"
                        >
                          <span class="toggle-slider-mini"></span>
                        </button>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
      <div class="option">
        <a href={siteHref} class="switch-button">
          {#if envInfo.isProduction}
            {t('nav.options.switch.test', 'Switch to Canary')}
          {:else if envInfo.isCanary || envInfo.isDevelopment}
            {t('nav.options.switch.prod', 'Switch to Main')}
          {:else}
            {t('nav.options.switch.dev', 'Switch to Development')}
          {/if}
        </a>
      </div>
    </div>
  </div>
{/if}

{#if showCookieConfirmDialog}
  <div class="confirm-overlay" transition:fade={{ duration: 200 }}>
    <div class="confirm-dialog" transition:slide={{ duration: 300 }}>
      <h3>🍪 Reset All Cookies?</h3>
      <p>This will delete all cookies for this domain. You may need to log in again and reset your preferences.</p>
      <div class="cookie-stats">
        <small>Current cookies: {getCookieCount()}</small>
      </div>
      <div class="confirm-buttons">
        <button 
          type="button" 
          class="confirm-btn confirm-cancel"
          onclick={cancelCookieReset}
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="confirm-btn confirm-reset"
          onclick={confirmCookieReset}
        >
          Reset Cookies
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showLocalStorageConfirmDialog}
  <div class="confirm-overlay" transition:fade={{ duration: 200 }}>
    <div class="confirm-dialog" transition:slide={{ duration: 300 }}>
      <h3>💾 Reset LocalStorage?</h3>
      <p>This will delete ALL data stored in LocalStorage for this domain, including:</p>
      <ul style="text-align: left; margin: 1vmin 0; padding-left: 2vmin;">
        <li>All stored items ({getLocalStorageCount()})</li>
        <li>Theme preferences</li>
        <li>Language settings</li>
      </ul>
      <p>Cookies will remain untouched.</p>
      <div class="confirm-buttons">
        <button 
          type="button" 
          class="confirm-btn confirm-cancel" 
          onclick={cancelLocalStorageReset}
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="confirm-btn confirm-reset"
          onclick={confirmLocalStorageReset}
        >
          Reset LocalStorage
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showEverythingConfirmDialog}
  <div class="confirm-overlay" transition:fade={{ duration: 200 }}>
    <div class="confirm-dialog" transition:slide={{ duration: 300 }}>
      <h3>🧨 Reset Everything?</h3>
      <p>This will delete <strong>ALL</strong> cookies and LocalStorage data for this domain:</p>
      <ul style="text-align: left; margin: 1vmin 0; padding-left: 2vmin;">
        <li>All cookies ({getCookieCount()})</li>
        <li>All localStorage items ({getLocalStorageCount()})</li>
        <li>Theme and language settings</li>
      </ul>
      <p><strong>This action cannot be undone!</strong></p>
      <div class="confirm-buttons">
        <button 
          type="button" 
          class="confirm-btn confirm-cancel" 
          onclick={cancelEverythingReset}
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="confirm-btn confirm-reset"
          onclick={confirmEverythingReset}
        >
          Reset Everything
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .navbar {
    position: fixed;
    top: 0;
    width: 100%;
    height: calc(2vmin + 1.5vmin + 1.5vmin);
    padding: 1.5vmin 1vmin;
    display: flex;
    align-items: center;
    z-index: 100;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .nav-buttons {
    position: fixed;
    display: flex;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    gap: 1.5vmin;
  }

  .nav-button {
    font-family: Aileron;
    text-decoration: none;
    font-size: 1.2rem;
    white-space: nowrap;
  }

  .hamburger {
    position: fixed;
    top: 0;
    left: 0;
    width: 20vmin;
    height: 100vh;
    max-width: 80%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 110;
    padding: 1.4vmin;
    padding-top: 4.5vmin;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hamburger-content {
    display: inline-block;
  }

  .hamburger-footer {
    user-select: none;
    text-align: center;
    font-family: Aileron;
    font-size: 0.9rem;
    border-top: 0.1vmin solid;
    padding-top: 1vmin;
  }

  .hamburger-footer a {
    font-size: 1rem;
  }

  .hamburger.open {
    transform: translateX(0);
  }

  .settings-button {
    position: fixed;
    right: 1vmin;
    user-select: none;
    background: none;
    border: none;
    cursor: pointer;
  }

  .settings-icon {
    user-select: none;
    height: 2.8vmin;
    transition: none;
    transform-origin: center;
  }
  
  .options-menu {
    position: fixed;
    top: 5.15vmin;
    right: 1vmin;
    padding: 1.5vmin;
    border-radius: 1vmin;
    z-index: 200;
    color: var(--color-primary);
    min-width: 40vmin;
    max-width: 46vmin;
    transition: all 0.3s ease;
  }
  
  .options-menu h2 {
    font-family: 'Aileron';
    margin-top: 0;
    font-size: 1.5rem;
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.5vmin;
    margin-bottom: 1vmin;
  }

  .switch-button {
    margin-top: 2vmin;
    display: inline-block;
    padding: 0.1vmin 0.2vmin;
    border: 0.2vmin solid hsl(22, 100%, 50%);
    border-radius: 0.5vmin;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: 200.0ms;
  }

  .switch-button:hover {
    border: 0.2vmin solid hsl(22, 100%, 60%);
    background: rgba(139, 59, 35, 0.274);
    transition: 200.0ms;
  }

  .selector {
    position: relative;
    display: inline-block;
    width: 18vmin;
  }

  /* Theme Selector Styles */

  .theme-button {
    background: none;
    border: 0.1vmin solid var(--color-primary);
    color: var(--color-primary);
    padding: 0.5vmin 1vmin;
    border-radius: 0.4vmin;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vmin;
    transition: background-color 0.2s;
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .theme-button:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .theme-icon {
    font-size: 1rem;
    display: inline-block;
    flex-shrink: 0;
  }

  .theme-name {
    font-size: 0.9rem;
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .dropdown-arrow {
    font-size: 0.8rem;
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  .dropdown-arrow.open {
    transform: rotate(180deg);
  }

  .theme-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: var(--bg-secondary);
    border: 0.1vmin solid;
    border-radius: 0.4vmin;
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    z-index: 1000;
    max-height: 250px;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }

  .theme-option {
    width: 100%;
    background: none;
    border: none;
    color: var(--color-primary);
    padding: 0.75vmin 1vmin;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vmin;
    transition: background-color 0.2s;
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
    min-height: 3.5vmin;
  }

  .theme-option:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .theme-option.active {
    background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
    font-weight: 500;
  }

  .theme-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .theme-option .theme-name {
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .theme-description {
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--color-primary) 70%, transparent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.1vmin;
  }

  .color-scheme-button {
    background: none;
    border: 0.1vmin solid var(--color-primary);
    color: var(--color-primary);
    padding: 0.5vmin 1vmin;
    border-radius: 0.4vmin;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vmin;
    transition: background-color 0.2s;
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .color-scheme-button:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .color-scheme-icon {
    font-size: 1rem;
    display: inline-block;
    flex-shrink: 0;
  }

  .color-scheme-name {
    font-size: 0.9rem;
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .color-scheme-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: var(--bg-secondary);
    border: 0.1vmin solid;
    border-radius: 0.4vmin;
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    z-index: 1000;
    max-height: 250px;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }

  .color-scheme-option {
    width: 100%;
    background: none;
    border: none;
    color: var(--color-primary);
    padding: 0.75vmin 1vmin;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vmin;
    transition: background-color 0.2s;
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
    min-height: 3.5vmin;
  }

  .color-scheme-option:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .color-scheme-option.active {
    background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
    font-weight: 500;
  }

  .color-scheme-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .color-scheme-option .color-scheme-name {
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .color-scheme-description {
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--color-primary) 70%, transparent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.1vmin;
  }

  .checkmark {
    color: var(--color-primary);
    font-weight: bold;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .menu-item {
    margin-top: 1vmin;
    margin-bottom: 1vmin;
    display: flex;
    flex-direction: column;
    justify-content: left;
  }

  .menu-item a {
    display: inline-block;
    line-height: 2.25vmin;
    font-family: Aileron;
    text-decoration: none;
    color: var(--color-primary);
    font-size: 1.2rem;
  }

  .env-indicator {
    margin-left: 0.5rem;
    color: var(--color-primary);
    font-size: 0.8rem;
    letter-spacing: 0.045vmin;
    background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
    padding: 0.1rem 0.3rem;
    border-radius: 0.4vmin;
    font-family: monospace;
  }

  .footer span {
    font-family: 'Redwing Light';
  }

  .reset-button {
    background: none;
    width: auto;
    border: 0.1vmin solid var(--color-primary);
    color: var(--color-primary);
    padding: 0.3vmin 0.6vmin;
    border-radius: 0.3vmin;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.3vmin;
  }

  .reset-button:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .devtools-section {
    border: 0.1vmin solid color-mix(in srgb, var(--color-primary) 30%, transparent);
    border-radius: 0.5vmin;
    padding: 0.5vmin;
    margin: 2.5vmin 0;
    margin-bottom: -1.5vmin;
    background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  }

  .devtools-header {
    margin: 0;
    padding: 0.5vmin;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    border-radius: 0.3vmin;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
  }

  .devtools-header:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .triangle {
    transition: transform 0.3s ease;
    transform-origin: center;
    display: inline-block;
    font-size: 0.8rem;
    color: var(--color-primary);
    pointer-events: none;
  }

  .triangle.expanded {
    transform: rotate(90deg);
  }

  .devtools-submenu {
    border-top: 0.2vmin solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    margin-top: 0.5vmin;
    padding-top: 0.5vmin;
  }

  /* Workspace panel system */
  .devtools-workspace-viewport {
    overflow: hidden;
    width: 100%;
  }

  .devtools-panel-track {
    display: flex;
    width: 200%;
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .devtools-panel {
    width: 50%;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .devtools-space-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    color: var(--color-primary);
    padding: 0.65vmin 0.5vmin;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    border-radius: 0.3vmin;
    transition: background-color 0.2s;
    text-align: left;
  }

  .devtools-space-item:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .space-chevron {
    font-size: 1.1rem;
    opacity: 0.6;
    pointer-events: none;
  }

  .devtools-back {
    display: inline-flex;
    align-items: center;
    gap: 0.3vmin;
    background: none;
    border: none;
    color: color-mix(in srgb, var(--color-primary) 70%, transparent);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.82rem;
    padding: 0.3vmin 0.4vmin;
    border-radius: 0.3vmin;
    margin-bottom: 0.3vmin;
    transition: color 0.2s, background-color 0.2s;
  }

  .devtools-back:hover {
    color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .devtools-space-title {
    margin: 0 0 0.6vmin 0;
    padding: 0 0.5vmin;
    font-size: 0.85rem;
    font-weight: 600;
    color: color-mix(in srgb, var(--color-primary) 75%, transparent);
    border-bottom: 0.1vmin solid color-mix(in srgb, var(--color-primary) 15%, transparent);
    padding-bottom: 0.4vmin;
  }

  .devtools-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0.8vmin 0;
    padding: 0 0.5vmin;
    font-size: 0.9rem;
  }

  .devtools-option span {
    color: color-mix(in srgb, var(--color-primary) 90%, transparent);
  }

  .toggle-switch-mini {
    position: relative;
    width: 3.5vmin;
    height: 1.8vmin;
    background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    border: 0.1vmin solid color-mix(in srgb, var(--color-primary) 25%, transparent);
    border-radius: 0.9vmin;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
  }

  .toggle-switch-mini.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .toggle-slider-mini {
    position: absolute;
    top: 0.2vmin;
    left: 0.2vmin;
    width: 1.2vmin;
    height: 1.2vmin;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toggle-switch-mini.active .toggle-slider-mini {
    transform: translateX(1.7vmin);
  }

  @media (any-pointer: coarse) {
    .toggle-switch-mini {
      width: 2.8rem;
      height: 1.6rem;
      border-radius: 0.8rem;
    }

    .toggle-slider-mini {
      top: 0.2rem;
      left: 0.2rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .toggle-switch-mini.active .toggle-slider-mini {
      transform: translateX(1.1rem);
    }
  }

  .confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    backdrop-filter: blur(0.5vmin);
    -webkit-backdrop-filter: blur(0.5vmin);
  }

  .confirm-dialog {
    background: var(--bg-body, #1a1a1a);
    border: 0.2vmin solid var(--color-primary);
    border-radius: 1vmin;
    padding: 2vmin;
    max-width: 30vmin;
    width: 30vmin;
    text-align: center;
    color: var(--color-primary);
  }

  .confirm-dialog h3 {
    margin: 0 0 1vmin 0;
    font-size: 1.3rem;
    color: var(--color-primary);
  }

  .confirm-dialog p {
    margin: 1vmin 0;
    line-height: 1.65vmin;
    color: inherit;
  }

  .cookie-stats {
    margin: 1vmin 0;
    padding: 0.5vmin;
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-radius: 0.4vmin;
  }

  .cookie-stats small {
    color: color-mix(in srgb, var(--color-primary) 80%, transparent);
    font-family: monospace;
  }

  .confirm-buttons {
    display: flex;
    gap: 1vmin;
    justify-content: center;
    margin-top: 1.5vmin;
  }

  .confirm-btn {
    padding: 0.7vmin 1.2vmin;
    border-radius: 0.4vmin;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
    border: 0.1tx solid;
  }

  .confirm-cancel {
    background: none;
    border-color: #666;
    color: #666;
  }

  .confirm-cancel:hover {
    background-color: rgba(102, 102, 102, 0.1);
    border-color: #888;
    color: #888;
  }

  .confirm-reset {
    background: none;
    border-color: #dc2626;
    color: #dc2626;
  }

  .confirm-reset:hover {
    background-color: #dc2626;
    color: white;
  }

  @media (max-width: 900px) {
    .navbar {
      height: auto;
      padding: calc(env(safe-area-inset-top) + 0.9rem) 1rem 0.9rem;
    }

    .nav-buttons {
      position: absolute;
      top: calc(50% + (env(safe-area-inset-top) * 0.5));
      left: 50%;
      width: calc(100% - 7.5rem);
      max-width: 24rem;
      justify-content: center;
      gap: 0.6rem;
      transform: translate(-50%, -50%);
    }

    .nav-button {
      font-size: clamp(0.82rem, 2.5vw, 0.96rem);
      padding: 0.2rem 0.1rem;
    }

    .hamburger {
      width: min(20rem, 85vw);
      padding: 1.25rem;
      padding-top: calc(env(safe-area-inset-top) + 3.8rem);
    }

    .options-menu {
      top: calc(env(safe-area-inset-top) + 4.25rem);
      right: 0.75rem;
      width: min(26rem, calc(100vw - 1.5rem));
      min-width: auto;
      max-width: none;
      padding: 1rem;
    }
  }

  @media (max-width: 640px) {
    .nav-buttons {
      width: calc(100% - 6.8rem);
      max-width: 19rem;
      gap: 0.42rem;
    }

    .nav-button {
      font-size: clamp(0.72rem, 2.8vw, 0.84rem);
      letter-spacing: 0.02em;
    }

    .hamburger {
      width: min(18rem, 88vw);
    }

    .options-menu {
      left: 0.75rem;
      right: 0.75rem;
      width: auto;
    }

    .option {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .selector {
      width: 100%;
    }

    .theme-button,
    .color-scheme-button {
      width: 100%;
    }
  }

  @media (any-pointer: coarse) {
    .navbar {
      height: auto;
      padding: calc(env(safe-area-inset-top) + 0.85rem) 1rem 0.85rem;
    }

    .nav-buttons {
      position: absolute;
      top: calc(50% + (env(safe-area-inset-top) * 0.5));
      left: 50%;
      width: calc(100% - 7.5rem);
      max-width: 24rem;
      justify-content: center;
      gap: 0.6rem;
      transform: translate(-50%, -50%);
    }

    .nav-button {
      font-size: clamp(0.82rem, 2.5vw, 0.96rem);
      padding: 0.2rem 0.1rem;
    }

    .hamburger {
      width: min(22rem, 86vw);
      padding: 1.25rem;
      padding-top: calc(env(safe-area-inset-top) + 4rem);
    }

    .hamburger-content {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .menu-item {
      margin: 0;
    }

    .menu-item a {
      line-height: 1.4;
      font-size: 1.25rem;
      padding: 0.45rem 0;
    }

    .hamburger-footer {
      font-size: 1rem;
      padding-top: 1rem;
    }

    .settings-button {
      min-width: 2.75rem;
      min-height: 2.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .settings-icon {
      height: 1.7rem;
    }

    .options-menu {
      top: calc(env(safe-area-inset-top) + 4.5rem);
      right: 0.75rem;
      min-width: min(28rem, calc(100vw - 1.5rem));
      max-width: min(30rem, calc(100vw - 1.5rem));
      padding: 1rem;
      border-radius: 1rem;
    }

    .options-menu h2 {
      font-size: 1.65rem;
    }

    .option {
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .option > span:first-child {
      font-size: 1rem;
    }

    .selector {
      width: 100%;
    }

    .switch-button,
    .theme-button,
    .color-scheme-button,
    .theme-option,
    .color-scheme-option,
    .reset-button,
    .confirm-btn {
      min-height: 2.9rem;
    }

    .switch-button,
    .theme-button,
    .color-scheme-button {
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
    }

    .theme-option,
    .color-scheme-option {
      padding: 0.85rem 1rem;
      gap: 0.75rem;
      min-height: 3.25rem;
    }

    .theme-name,
    .color-scheme-name {
      font-size: 1rem;
    }

    .theme-description,
    .color-scheme-description {
      font-size: 0.85rem;
    }

    .dropdown-arrow,
    .triangle,
    .checkmark {
      font-size: 0.95rem;
    }

    .devtools-option {
      gap: 0.75rem;
      align-items: flex-start;
    }

    .confirm-dialog {
      width: min(24rem, calc(100vw - 1.5rem));
      max-width: min(24rem, calc(100vw - 1.5rem));
      padding: 1.5rem;
      border-radius: 1rem;
    }

    .confirm-dialog p {
      line-height: 1.6;
    }

    .confirm-buttons {
      flex-direction: column;
    }

    .confirm-btn {
      width: 100%;
      padding: 0.85rem 1rem;
      border-radius: 0.75rem;
    }
  }
</style>