<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { afterNavigate } from '$app/navigation';
  import { t, initializeI18n } from '$lib/stores/i18n';
  import { useHoverConfig, type HoverConfig } from '$lib/stores/hoverConfig';
  import LanguageSelector from '$lib/UI/utils/LanguageSelector.svelte';
  import { 
    theme, 
    colorScheme,
    setTheme, 
    setColorScheme,
    applyStyles,
    type Theme,
    type ColorScheme,
  } from '$lib/stores/theme';
  import { 
    environmentStore, 
    generateEnvironmentUrl, 
    getEnvironmentDisplayName 
  } from '$lib/utils/environment';
  import { 
    getCookieCount,
    deleteAllCookies, 
    getLocalStorageCount, 
    resetAllStates 
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

  let showOptions = false;
  let showThemeDropdown = false;
  let showColorSchemeDropdown = false;
  let showCookieConfirmDialog = false;
  let showStatesConfirmDialog = false;
  let showDevToolsSubmenu = false;
  let isOpen = false;
  let siteHref = "";
  let currentTheme: Theme;
  let currentColorScheme: ColorScheme;
  let gearElement: HTMLImageElement;
  let isHoveringGear = false;
  let animationId: number;
  let currentRotation = 0;
  let targetSpeed = 0;
  let currentSpeed = 0;
  let languageSelectorRef: LanguageSelector;

  // Environment info
  $: envInfo = $environmentStore;
  $: footerEnv = getEnvironmentDisplayName(envInfo.environment);
  $: showDevTools = envInfo.isDevelopment;

  theme.subscribe(value => {
    currentTheme = value;
  });

  colorScheme.subscribe(value => {
    currentColorScheme = value;
  });

  const hoverConfigs: HoverConfig[] = [
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
  ];

  useHoverConfig(hoverConfigs);

  $: themeOptions = [
    { 
      value: 'default' as Theme, 
      label: $t('nav.options.theme.default', 'Default'), 
      icon: '🎨',
      description: $t('nav.options.theme.default.desc', 'The ELECTRIS Style')
    }
  ] as ThemeOption[];

  $: colorSchemeOptions = [
    { 
      value: 'auto' as ColorScheme, 
      label: $t('nav.options.color.auto', 'Automatic'), 
      icon: '🔄',
      description: $t('nav.options.color.auto.desc', 'Follows system')
    },
    { 
      value: 'light' as ColorScheme, 
      label: $t('nav.options.color.light', 'Light'), 
      icon: '☀️',
      description: $t('nav.options.color.light.desc', 'Clean and bright')
    },
    { 
      value: 'dark' as ColorScheme, 
      label: $t('nav.options.color.dark', 'Dark'), 
      icon: '🌙',
      description: $t('nav.options.color.dark.desc', 'Easy on the eyes')
    },
    { 
      value: 'midnight' as ColorScheme, 
      label: $t('nav.options.color.oled', 'Midnight'), 
      icon: '🌚',
      description: $t('nav.options.color.oled.desc', 'Looks like there\'s a blackout...')
    }
  ] as ColorSchemeOption[];

  $: currentThemeInfo = themeOptions.find(t => t.value === currentTheme) || themeOptions[0];
  $: currentColorSchemeInfo = colorSchemeOptions.find(c => c.value === currentColorScheme) || colorSchemeOptions[0];

  $: menuItems = [
    { label: $t('nav.burger.home', 'Home'), href: '/', newTab: false },
    { label: $t('blog.title', 'Blog'), href: '/blog', newTab: false },
    { label: $t('nav.burger.social', 'Socials'), href: '/socials', newTab: false },
    { label: $t('nav.burger.egs', 'Game Studios'), href: '/egs', newTab: false },
    { label: $t('nav.burger.ems', 'Media Studios'), href: '/ems', newTab: false }
  ];

  $: newHomeItems = [
    { label: $t('site.newhome.version', 'NewHome'), href: '/newhome', newTab: false },
    { label: $t('blog.title', 'Blog'), href: 'https://electris.net/blog', newTab: true },
    { label: $t('nav.burger.social', 'Socials'), href: 'https://electris.net/socials', newTab: true },
    { label: $t('nav.burger.egs', 'Game Studios'), href: 'https://electris.net/egs', newTab: true },
    { label: $t('nav.burger.ems', 'Media Studios'), href: 'https://electris.net/ems', newTab: true }
  ];

  $: {
    targetSpeed = 0;
    if (isHoveringGear) {
      targetSpeed += 1;
    }
    if (showOptions) {
      targetSpeed += 1;
    }
    startGearAnimation();
  }

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
    await environmentStore.refresh();
    
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      applyStyles(currentTheme, currentColorScheme);
    }
  });

  afterNavigate(() => {
    updateSiteHref();
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
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
        showStatesConfirmDialog = false;
        showDevToolsSubmenu = false;
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
    setTheme(themeValue);
    showThemeDropdown = false;
  }

  function handleColorSchemeChange(colorSchemeValue: ColorScheme) {
    setColorScheme(colorSchemeValue);
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
      showStatesConfirmDialog = false;
      showDevToolsSubmenu = false;
    }
    startGearAnimation();
  }

  function toggleDevToolsSubmenu(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    showDevToolsSubmenu = !showDevToolsSubmenu;
  }

  function handleCookieReset() {
    showCookieConfirmDialog = true;
  }

  function handleStatesReset() {
    showStatesConfirmDialog = true;
  }

  function confirmCookieReset() {
    const result = deleteAllCookies();
    showCookieConfirmDialog = false;
    showOptions = false;
    alert(`Cookies reset complete!`);
    window.location.reload();
  }

  function confirmStatesReset() {
    const result = resetAllStates();
    showStatesConfirmDialog = false;
    showOptions = false;
    alert(`States reset complete!`);
    window.location.reload();
  }

  function cancelCookieReset() {
    showCookieConfirmDialog = false;
  }

  function cancelStatesReset() {
    showStatesConfirmDialog = false;
  }
</script>

<nav class="navbar">
  <div class="nav-buttons">
    <a class="nav-button abt" href="/about">{$t('about.hero', 'About Us')}</a>
    <a class="nav-button elts" href="/">{$t('site.title', 'ELECTRIS')}</a>
    <a class="nav-button proj" href="/projects">{$t('nav.bar.proj', 'Projects')}</a>
  </div>
  <Hamburger {isOpen} on:toggle={() => isOpen = !isOpen} />
  {#if isOpen}
    <div class="overlay" role="button" tabindex="0" on:click={() => isOpen = false} on:keydown={(e) => e.key === 'Escape' && (isOpen = false)} transition:fade={{ duration: 200 }} aria-label="Close Menu"></div>
  {/if}
  <button
    type="button"
    class="settings-button"
    on:click={handleOptionsToggle}
    on:mouseenter={handleGearHover}
    on:mouseleave={handleGearLeave}>
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
            on:click={() => isOpen = false}>
            {item.label}
          </a>
        </div>
      {/each}
    </div>
      <div class="wrap-no-interact-all hamburger-footer" role="region"
        on:mouseenter={(e: MouseEvent) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          window.dispatchEvent(new CustomEvent('footerHovered', { detail: { x: centerX, y: centerY } }));
        }}
        on:mouseleave={() => {
          window.dispatchEvent(new CustomEvent('footerUnhovered'));
        }}>
        <div class="footer">
          <p><u>{$t('site.title', 'ELECTRIS')} &#169;2025</u></p>
          <a href="https://github.com/ItzELECTR0/electris.net" target="_blank"><u>{envInfo.siteVersion}</u></a>
          <span class="env-indicator">{footerEnv}</span>
        </div>
      </div>
  </div>
</nav>

{#if showOptions}
  <div class="options-menu" transition:fade={{ duration: 200 }}>
    <div transition:slide={{ duration: 300 }}>
      <h2>{$t('nav.options', 'Options')}</h2>
      
      <div class="option">
        <span>{$t('nav.options.theme', 'Theme')}</span>
          <div class="selector">
            <button 
              type="button" 
              class="theme-button"
              on:click={toggleThemeDropdown}
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
                    class:active={currentTheme === themeOption.value}
                    on:click={() => handleThemeChange(themeOption.value)}
                    role="option"
                    aria-selected={currentTheme === themeOption.value}
                    title={themeOption.description}
                  >
                    <span class="wrap-no-interact">{themeOption.icon}</span>
                    <div class="theme-info">
                      <span class="theme-name">{themeOption.label}</span>
                      {#if themeOption.description}
                        <span class="theme-description">{themeOption.description}</span>
                      {/if}
                    </div>
                    {#if currentTheme === themeOption.value}
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
        <span>{$t('nav.options.color', 'Color')}</span>
        <div class="selector">
          <button 
            type="button" 
            class="color-scheme-button"
            on:click={toggleColorSchemeDropdown}
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
                  class:active={currentColorScheme === colorOption.value}
                  on:click={() => handleColorSchemeChange(colorOption.value)}
                  role="option"
                  aria-selected={currentColorScheme === colorOption.value}
                  title={colorOption.description}
                >
                  <span class="wrap-no-interact">{colorOption.icon}</span>
                  <div class="color-scheme-info">
                    <span class="color-scheme-name">{colorOption.label}</span>
                    {#if colorOption.description}
                      <span class="color-scheme-description">{colorOption.description}</span>
                    {/if}
                  </div>
                  {#if currentColorScheme === colorOption.value}
                    <span class="checkmark">✓</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="option">
        <span>{$t('nav.options.lang', 'Language')}</span>
        <LanguageSelector bind:this={languageSelectorRef} />
      </div>
      {#if showDevTools}
        <div class="devtools-section">
          <div 
            class="devtools-header option"
            on:click={toggleDevToolsSubmenu}
            aria-expanded={showDevToolsSubmenu}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && toggleDevToolsSubmenu(e)}
          >
            <span>{$t('devtools.title', 'DevTools')}</span>
            <span class="triangle" class:expanded={showDevToolsSubmenu}>▸</span>
          </div>
          {#if showDevToolsSubmenu}
            <div class="devtools-submenu" transition:slide={{ duration: 300 }}>
              <div class="devtools-option">
                <span>{$t('devtools.reset.cookies', 'Reset Cookies')}</span>
                <button 
                  type="button" 
                  class="reset-button"
                  on:click={handleCookieReset}
                  title="Reset all cookies (Development only)"
                >
                  🍪 {$t('devtools.reset', 'Reset')}
                </button>
              </div>
              <div class="devtools-option">
                <span>{$t('devtools.reset.states', 'Reset States')}</span>
                <button 
                  type="button" 
                  class="reset-button"
                  on:click={handleStatesReset}
                  title="Reset all states (Development only)"
                >
                  🔄 {$t('devtools.reset', 'Reset')}
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
      <div class="option">
        <a href={siteHref} class="switch-button">
          {#if envInfo.isProduction}
            {$t('nav.options.switch.test', 'Switch to Canary')}
          {:else if envInfo.isCanary || envInfo.isDevelopment}
            {$t('nav.options.switch.prod', 'Switch to Main')}
          {:else}
            {$t('nav.options.switch.dev', 'Switch to Development')}
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
          on:click={cancelCookieReset}
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="confirm-btn confirm-reset"
          on:click={confirmCookieReset}
        >
          Reset Cookies
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showStatesConfirmDialog}
  <div class="confirm-overlay" transition:fade={{ duration: 200 }}>
    <div class="confirm-dialog" transition:slide={{ duration: 300 }}>
      <h3>🔄 Reset All States?</h3>
      <p>This will delete ALL cookies and localStorage data for this domain, including:</p>
      <ul style="text-align: left; margin: 1vh 0; padding-left: 2vh;">
        <li>All cookies ({getCookieCount()})</li>
        <li>All localStorage items ({getLocalStorageCount()})</li>
        <li>Theme preferences</li>
        <li>Language settings</li>
      </ul>
      <p><strong>You will need to reconfigure EVERYTHING!</strong></p>
      <div class="confirm-buttons">
        <button 
          type="button" 
          class="confirm-btn confirm-cancel" 
          on:click={cancelStatesReset}
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="confirm-btn confirm-reset"
          on:click={confirmStatesReset}
        >
          Reset All States
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
    height: calc(2vh + 1.5vh + 1.5vh);
    padding: 1.5vh 1vh;
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
    gap: 1.5vh;
  }

  .nav-button {
    font-family: sans-serif;
    text-decoration: none;
    font-size: 1.2rem;
    white-space: nowrap;
  }

  .hamburger {
    position: fixed;
    top: 0;
    left: 0;
    width: 20vh;
    height: 100vh;
    max-width: 80%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 110;
    padding: 1.4vh;
    padding-top: 4.5vh;
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
    font-family: sans-serif;
    font-size: 0.9rem;
    border-top: 0.1vh solid;
    padding-top: 1vh;
  }

  .hamburger-footer a {
    font-size: 1rem;
  }

  .hamburger.open {
    transform: translateX(0);
  }

  .settings-button {
    position: fixed;
    right: 1vh;
    user-select: none;
    background: none;
    border: none;
    cursor: pointer;
  }

  .settings-icon {
    user-select: none;
    height: 2.8vh;
    transition: none;
    transform-origin: center;
  }
  
  .options-menu {
    position: fixed;
    top: 5vh;
    right: 1vh;
    padding: 1.5vh;
    border-radius: 1vh;
    z-index: 200;
    color: #f65901;
    min-width: 35vh;
    max-width: 40vh;
    transition: all 0.3s ease;
  }
  
  .options-menu h2 {
    font-family: 'sans-sherif';
    margin-top: 0;
    font-size: 1.5rem;
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.5vh;
    margin-bottom: 1vh;
  }

  .switch-button {
    margin-top: 2vh;
    display: inline-block;
    padding: 0.1vh 0.2vh;
    border: 0.2vh solid hsl(22, 100%, 50%);
    border-radius: 0.5vh;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: 200.0ms;
  }

  .switch-button:hover {
    border: 0.2vh solid hsl(22, 100%, 60%);
    background: rgba(139, 59, 35, 0.274);
    transition: 200.0ms;
  }

  .selector {
    position: relative;
    display: inline-block;
    width: 18vh;
  }

  /* Theme Selector Styles */

  .theme-button {
    background: none;
    border: 0.1vh solid #f65901;
    color: #f65901;
    padding: 0.5vh 1vh;
    border-radius: 0.4vh;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vh;
    transition: background-color 0.2s;
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .theme-button:hover {
    background-color: rgba(246, 89, 1, 0.1);
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
    background: var(--bg-secondary, #1a1a1a);
    border: 0.1vh solid;
    border-radius: 0.4vh;
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
    color: #f65901;
    padding: 0.75vh 1vh;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vh;
    transition: background-color 0.2s;
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
    min-height: 3.5vh;
  }

  .theme-option:hover {
    background-color: rgba(246, 89, 1, 0.1);
  }

  .theme-option.active {
    background-color: rgba(246, 89, 1, 0.2);
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
    color: rgba(246, 89, 1, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.1vh;
  }

  .color-scheme-button {
    background: none;
    border: 0.1vh solid #f65901;
    color: #f65901;
    padding: 0.5vh 1vh;
    border-radius: 0.4vh;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vh;
    transition: background-color 0.2s;
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .color-scheme-button:hover {
    background-color: rgba(246, 89, 1, 0.1);
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
    background: var(--bg-secondary, #1a1a1a);
    border: 0.1vh solid;
    border-radius: 0.4vh;
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
    color: #f65901;
    padding: 0.75vh 1vh;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vh;
    transition: background-color 0.2s;
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
    min-height: 3.5vh;
  }

  .color-scheme-option:hover {
    background-color: rgba(246, 89, 1, 0.1);
  }

  .color-scheme-option.active {
    background-color: rgba(246, 89, 1, 0.2);
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
    color: rgba(246, 89, 1, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.1vh;
  }

  .checkmark {
    color: #f65901;
    font-weight: bold;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .menu-item {
    margin-top: 1vh;
    margin-bottom: 1vh;
    display: flex;
    flex-direction: column;
    justify-content: left;
  }

  .menu-item a {
    display: inline-block;
    line-height: 2.25vh;
    font-family: sans-serif;
    text-decoration: none;
    color: #f65901;
    font-size: 1.2rem;
  }

  .env-indicator {
    margin-left: 0.5rem;
    color: #f65901;
    font-size: 0.8rem;
    letter-spacing: 0.045vh;
    background-color: rgba(246, 89, 1, 0.2);
    padding: 0.1rem 0.3rem;
    border-radius: 0.4vh;
    font-family: monospace;
  }

  .footer span {
    font-family: 'Redwing Light';
  }

  .reset-button {
    background: none;
    width: auto;
    border: 0.1vh solid #f65901;
    color: #f65901;
    padding: 0.3vh 0.6vh;
    border-radius: 0.3vh;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.3vh;
  }

  .reset-button:hover {
    background-color: rgba(246, 89, 1, 0.1);
  }

  .devtools-section {
    border: 0.1vh solid rgba(246, 89, 1, 0.3);
    border-radius: 0.5vh;
    padding: 0.5vh;
    margin: 2.5vh 0;
    margin-bottom: -1.5vh;
    background: rgba(246, 89, 1, 0.05);
  }

  .devtools-header {
    margin: 0;
    padding: 0.5vh;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    border-radius: 0.3vh;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
  }

  .devtools-header:hover {
    background-color: rgba(246, 89, 1, 0.1);
  }

  .triangle {
    transition: transform 0.3s ease;
    transform-origin: center;
    display: inline-block;
    font-size: 0.8rem;
    color: #f65901;
    pointer-events: none;
  }

  .triangle.expanded {
    transform: rotate(90deg);
  }

  .devtools-submenu {
    border-top: 0.2vh solid rgba(246, 89, 1, 0.2);
    margin-top: 0.5vh;
    padding-top: 0.5vh;
  }

  .devtools-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0.8vh 0;
    padding: 0 0.5vh;
    font-size: 0.9rem;
  }

  .devtools-option span {
    color: rgba(246, 89, 1, 0.9);
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
    backdrop-filter: blur(0.5vh);
    -webkit-backdrop-filter: blur(0.5vh);
  }

  .confirm-dialog {
    background: var(--bg-primary, #1a1a1a);
    border: 0.2vh solid #f65901;
    border-radius: 1vh;
    padding: 2vh;
    max-width: 30vh;
    width: 30vh;
    text-align: center;
    color: #f65901;
  }

  .confirm-dialog h3 {
    margin: 0 0 1vh 0;
    font-size: 1.3rem;
    color: #f65901;
  }

  .confirm-dialog p {
    margin: 1vh 0;
    line-height: 1.65vh;
    color: inherit;
  }

  .cookie-stats {
    margin: 1vh 0;
    padding: 0.5vh;
    background: rgba(246, 89, 1, 0.1);
    border-radius: 0.4vh;
  }

  .cookie-stats small {
    color: rgba(246, 89, 1, 0.8);
    font-family: monospace;
  }

  .confirm-buttons {
    display: flex;
    gap: 1vh;
    justify-content: center;
    margin-top: 1.5vh;
  }

  .confirm-btn {
    padding: 0.7vh 1.2vh;
    border-radius: 0.4vh;
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

  :global([data-color-scheme="light"]) .theme-dropdown,
  :global([data-theme="light"]) .color-scheme-dropdown {
    background: var(--bg-secondary, #f0f0f0);
    color: #333;
  }

  :global([data-color-scheme="light"]) .theme-button,
  :global([data-color-scheme="light"]) .theme-option,
  :global([data-color-scheme="light"]) .color-scheme-button,
  :global([data-color-scheme="light"]) .color-scheme-option {
    color: #f65901;
  }

  :global([data-color-scheme="light"]) .theme-description,
  :global([data-color-scheme="light"]) .color-scheme-description {
    color: rgba(246, 89, 1, 0.6);
  }
</style>