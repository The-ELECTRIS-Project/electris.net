<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { afterNavigate } from '$app/navigation';
  import { t } from '$lib/state/i18n.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import LanguageSelector from '$lib/components/ui/LanguageSelector.svelte';
  import { modsState } from '$lib/state/mods.svelte';
  import { 
    themeState,
    type Theme,
    type ColorScheme,
  } from '$lib/state/theme.svelte';
  import { 
    environmentState, 
    generateEnvironmentUrl, 
    getEnvironmentDisplayName 
  } from '$lib/state/environment.svelte';
  import { 
    getCookieCount,
    deleteAllCookies, 
    getLocalStorageCount,
    clearAllLocalStorage,
    resetAllStates,
    setIgnoreExcludedSuffixes
  } from '$lib/utils/devTools';
  import Hamburger from '$lib/components/ui/Hamburger.svelte';
  import SettingsIcon, { type IconName } from '$lib/components/ui/icons/Settings.svelte';

  type OptionsSpace = 'appearance' | 'interface' | 'devtools' | 'site-data' | 'youtube-api';

  interface ThemeOption {
    value: Theme;
    label: string;
    icon: IconName;
    description?: string;
  }

  interface ColorSchemeOption {
    value: ColorScheme;
    label: string;
    icon: IconName;
    description?: string;
  }

  let showOptions = $state(false);
  let showThemeDropdown = $state(false);
  let showColorSchemeDropdown = $state(false);
  let showCookieConfirmDialog = $state(false);
  let showLocalStorageConfirmDialog = $state(false);
  let showEverythingConfirmDialog = $state(false);
  let optionsSpace: OptionsSpace | null = $state(null);
  let workspaceLevel = $derived(
    optionsSpace === 'site-data' || optionsSpace === 'youtube-api' ? 2 : (optionsSpace ? 1 : 0)
  );
  let trackTransform = $derived(`translateX(-${(workspaceLevel * 100) / 3}%)`);
  let isOpen = $state(false);
  let siteHref = $state("");
  let gearElement: HTMLImageElement | undefined = $state();
  let isHoveringGear = $state(false);
  let animationId: number;
  let currentRotation = 0;
  let targetSpeed = $state(0);
  let currentSpeed = 0;

  let envInfo = $derived(environmentState.info);
  let footerEnv = $derived(getEnvironmentDisplayName(envInfo.environment));
  let showDevTools = $derived(envInfo.isProduction ? false : (envInfo.isDevelopment || envInfo.isCanary));
  let ignoreExcludedSuffixes = $derived(modsState.config.devTools.ignoreExcludedSuffixes);
  let hideScrollbar = $derived(modsState.config.site.hideScrollbar);
  let disableOrbit = $derived(modsState.config.site.disableOrbit);

  useHoverConfig([
    {
      type: [ 'a' ],
      selectors: ['.menu-item a'],
      className: 'hovered-menu-item',
      lockPosition: true,
      dynamicSizeOffset: 1,
      absoluteBorderRadiusOffset: 0.8
    },
    {
      selectors: [
        '.option',
        '.options-space-item',
        '.options-back',
        '.theme-button',
        '.color-scheme-button',
        '.theme-option',
        '.color-scheme-option',
        '.toggle-switch-mini',
        '.reset-button',
        '.confirm-btn'
      ],
      className: 'hovered-word-wrap',
      lockPosition: true
    },
    {
      selectors: ['.hamburger-footer', '.footer'],
      className: 'hovered-hamburger-footer',
      requireAllSelectors: false,
      lockPosition: true,
      color: 'var(--circle-hover-footer)',
      positionOffset: { y: 0.5 },
      dynamicSizeOffset: {
        width: -4.5
      },
      absoluteBorderRadiusOffset: 1.2
    },
    {
      selectors: ['.hamburger-button'],
      className: 'hovered-hamburger',
      lockPosition: true,
      absoluteSizeOffset: 4,
      absoluteBorderRadiusOffset: 5
    },
    {
      selectors: ['.settings-button'],
      className: 'hovered-settings',
      lockPosition: true,
      absoluteSizeOffset: 3.5,
      absoluteBorderRadiusOffset: 5,
      customPositioning: {
       targetSelector: '.settings-icon'
      }
    },
    {
      type: [ 'a' ],
      selectors: ['.switch-button'],
      className: 'hovered-word-wrap',
      lockPosition: true,
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
      icon: 'theme-default',
      description: t('nav.options.theme.electrified.desc', 'The ELECTRIS Style')
    },
    { 
      value: 'cyber-neotic' as Theme, 
      label: t('nav.options.theme.cyber', 'Cyber-Neotic'), 
      icon: 'theme-cyber',
      description: t('nav.options.theme.cyber.desc', 'A neon-lit future')
    }
  ] as ThemeOption[]);

  let colorSchemeOptions = $derived([
    { 
      value: 'auto' as ColorScheme, 
      label: t('nav.options.color.auto', 'Automatic'), 
      icon: 'color-auto',
      description: t('nav.options.color.auto.desc', 'Follows system')
    },
    { 
      value: 'light' as ColorScheme, 
      label: t('nav.options.color.light', 'Light'), 
      icon: 'color-light',
      description: t('nav.options.color.light.desc', 'Clean and bright')
    },
    { 
      value: 'dark' as ColorScheme, 
      label: t('nav.options.color.dark', 'Dark'), 
      icon: 'color-dark',
      description: t('nav.options.color.dark.desc', 'Easy on the eyes')
    },
    { 
      value: 'midnight' as ColorScheme, 
      label: t('nav.options.color.oled', 'Midnight'), 
      icon: 'color-midnight',
      description: t('nav.options.color.oled.desc', 'Looks like there\'s a blackout...')
    }
  ] as ColorSchemeOption[]);

  let currentThemeInfo = $derived(themeOptions.find(t => t.value === themeState.theme) || themeOptions[0]);
  let currentColorSchemeInfo = $derived(colorSchemeOptions.find(c => c.value === themeState.colorScheme) || colorSchemeOptions[0]);

  let menuItems = $derived([
    { label: t('nav.burger.home'), href: '/', newTab: false },
    { label: t('blog.title'), href: '/blog', newTab: false },
    { label: t('nav.burger.music'), href: '/music', newTab: false },
    { label: t('nav.burger.social'), href: '/socials', newTab: false },
    { label: t('nav.burger.donate'), href: '/donate', newTab: false }
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
    updateSiteHref();
    
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
        optionsSpace = null;
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

  function handleOptionsToggle(event?: MouseEvent | KeyboardEvent) {
    if (event) event.stopPropagation();
    showOptions = !showOptions;
    if (!showOptions) {
      showThemeDropdown = false;
      showColorSchemeDropdown = false;
      showCookieConfirmDialog = false;
      showLocalStorageConfirmDialog = false;
      showEverythingConfirmDialog = false;
      optionsSpace = null;
    }
    startGearAnimation();
  }

  function openOptionsSpace(space: OptionsSpace, event?: MouseEvent) {
    if (event) event.stopPropagation();
    closeLanguageDropdown();
    showThemeDropdown = false;
    showColorSchemeDropdown = false;
    optionsSpace = space;
  }

  function handleOptionsBack(event: MouseEvent) {
    event.stopPropagation();
    closeLanguageDropdown();
    showThemeDropdown = false;
    showColorSchemeDropdown = false;
    optionsSpace = optionsSpace === 'site-data' || optionsSpace === 'youtube-api' ? 'devtools' : null;
  }

  function getOptionsSpaceTitle(space: OptionsSpace) {
    switch (space) {
      case 'appearance':
        return t('nav.options.space.appearance', 'Appearance');
      case 'interface':
        return t('nav.options.space.interface', 'Interface');
      case 'devtools':
        return t('devtools.title', 'DevTools');
      case 'site-data':
        return t('devtools.space.sitedata', 'Manage Site Data');
      case 'youtube-api':
        return t('devtools.space.ytapi', 'YouTube API');
    }
  }

  function toggleIgnoreExcludedSuffixes() {
    setIgnoreExcludedSuffixes(!ignoreExcludedSuffixes);
  }

  function toggleHideScrollbar() {
    modsState.updateSetting('site', 'hideScrollbar', !hideScrollbar);
    themeState.applyCurrentStyles();
  }

  function toggleDisableOrbit() {
    modsState.updateSetting('site', 'disableOrbit', !disableOrbit);
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
  <div class="options-overlay" role="button" tabindex="0" onclick={() => handleOptionsToggle()} onkeydown={(e) => e.key === 'Escape' && handleOptionsToggle()} transition:fade={{ duration: 200 }} aria-label="Close Options"></div>
  <div class="options-menu" transition:fade={{ duration: 200 }}>
    <div transition:slide={{ duration: 300 }}>
      <h2>{t('nav.options', 'Options')}</h2>

      <div class="options-workspace-viewport">
        <div
          class="options-panel-track"
          style:transform={trackTransform}
          style:width="300%"
        >
          <!-- Level 0: Main Options -->
          <div class="options-panel" class:active={workspaceLevel === 0}>
            <button
              type="button"
              class="options-space-item"
              onclick={(e) => openOptionsSpace('appearance', e)}
            >
              <div class="options-space-label">
                <SettingsIcon name="appearance" />
                <span>{t('nav.options.space.appearance', 'Appearance')}</span>
              </div>
              <SettingsIcon name="chevron-right" size="1rem" class="space-chevron" />
            </button>
            <button
              type="button"
              class="options-space-item"
              onclick={(e) => openOptionsSpace('interface', e)}
            >
              <div class="options-space-label">
                <SettingsIcon name="interface" />
                <span>{t('nav.options.interface', 'Interface')}</span>
              </div>
              <SettingsIcon name="chevron-right" size="1rem" class="space-chevron" />
            </button>
            {#if showDevTools}
              <button
                type="button"
                class="options-space-item"
                onclick={(e) => openOptionsSpace('devtools', e)}
              >
                <div class="options-space-label">
                  <SettingsIcon name="devtools" />
                  <span>{t('devtools.title', 'DevTools')}</span>
                </div>
                <SettingsIcon name="chevron-right" size="1rem" class="space-chevron" />
              </button>
            {/if}
            <div class="option environment-option">
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

          <!-- Level 1: Sub-spaces -->
          <div class="options-panel" class:active={workspaceLevel === 1}>
            {#if optionsSpace && (optionsSpace === 'appearance' || optionsSpace === 'interface' || optionsSpace === 'devtools')}
              <button
                type="button"
                class="options-back"
                onclick={handleOptionsBack}
              >
                <SettingsIcon name="chevron-left" size="0.8rem" />
                {t('devtools.back', 'Back')}
              </button>
              <p class="options-space-title">{getOptionsSpaceTitle(optionsSpace)}</p>

              {#if optionsSpace === 'appearance'}
                <!-- ... Appearance Content ... -->
                <div class="option">
                  <div class="option-label">
                    <SettingsIcon name="theme" size="1.1rem" />
                    <span>{t('nav.options.theme', 'Theme')}</span>
                  </div>
                  <div class="selector theme-selector">
                    <button 
                      type="button" 
                      class="theme-button"
                      onclick={toggleThemeDropdown}
                      aria-expanded={showThemeDropdown}
                      aria-haspopup="listbox"
                    >
                      <SettingsIcon name={currentThemeInfo.icon} size="1.1rem" class="theme-icon" />
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
                            <SettingsIcon name={themeOption.icon} size="1rem" />
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

                <div class="option">
                  <div class="option-label">
                    <SettingsIcon name="color" size="1.1rem" />
                    <span>{t('nav.options.color', 'Color')}</span>
                  </div>
                  <div class="selector color-scheme-selector">
                    <button 
                      type="button" 
                      class="color-scheme-button"
                      onclick={toggleColorSchemeDropdown}
                      aria-expanded={showColorSchemeDropdown}
                      aria-haspopup="listbox"
                    >
                      <SettingsIcon name={currentColorSchemeInfo.icon} size="1.1rem" class="color-scheme-icon" />
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
                            <SettingsIcon name={colorOption.icon} size="1rem" />
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
              {:else if optionsSpace === 'interface'}
                <div class="option">
                  <div class="option-label">
                    <SettingsIcon name="language" size="1.1rem" />
                    <span>{t('nav.options.lang', 'Language')}</span>
                  </div>
                  <LanguageSelector />
                </div>
                <div class="option">
                  <div class="option-label">
                    <SettingsIcon name="scrollbar" size="1.1rem" />
                    <span>{t('nav.options.scrollbar.hide', 'Hide Scrollbar')}</span>
                  </div>
                  <button
                    type="button"
                    class="toggle-switch-mini"
                    class:active={hideScrollbar}
                    onclick={toggleHideScrollbar}
                    aria-label="Toggle hide scrollbar"
                  >
                    <span class="toggle-slider-mini"></span>
                  </button>
                </div>
                <div class="option">
                  <div class="option-label">
                    <SettingsIcon name="orbit" size="1.1rem" />
                    <span>{t('nav.options.orbit.disable', 'Disable Orbit')}</span>
                  </div>
                  <button
                    type="button"
                    class="toggle-switch-mini"
                    class:active={disableOrbit}
                    onclick={toggleDisableOrbit}
                    aria-label="Toggle disable orbit"
                  >
                    <span class="toggle-slider-mini"></span>
                  </button>
                </div>
              {:else if optionsSpace === 'devtools'}
                <button
                  type="button"
                  class="options-space-item"
                  onclick={(e) => openOptionsSpace('site-data', e)}
                >
                  <div class="options-space-label">
                    <SettingsIcon name="sitedata" />
                    <span>{t('devtools.space.sitedata', 'Manage Site Data')}</span>
                  </div>
                  <SettingsIcon name="chevron-right" size="1rem" class="space-chevron" />
                </button>
                <button
                  type="button"
                  class="options-space-item"
                  onclick={(e) => openOptionsSpace('youtube-api', e)}
                >
                  <div class="options-space-label">
                    <SettingsIcon name="ytapi" />
                    <span>{t('devtools.space.ytapi', 'YouTube API')}</span>
                  </div>
                  <SettingsIcon name="chevron-right" size="1rem" class="space-chevron" />
                </button>
              {/if}
            {/if}
          </div>

          <!-- Level 2: Nested Sub-spaces (DevTools child spaces) -->
          <div class="options-panel" class:active={workspaceLevel === 2}>
            {#if optionsSpace && (optionsSpace === 'site-data' || optionsSpace === 'youtube-api')}
              <button
                type="button"
                class="options-back"
                onclick={handleOptionsBack}
              >
                <SettingsIcon name="chevron-left" size="0.8rem" />
                {t('devtools.back', 'Back')}
              </button>
              <p class="options-space-title">{getOptionsSpaceTitle(optionsSpace)}</p>

              {#if optionsSpace === 'site-data'}
                <div class="devtools-option">
                  <span>{t('devtools.reset.cookies', 'Reset Cookies')}</span>
                  <button
                    type="button"
                    class="reset-button"
                    onclick={handleCookieReset}
                    title="Reset all cookies"
                  >
                    <SettingsIcon name="reset-cookie" size="1rem" />
                    {t('devtools.reset', 'Reset')}
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
                    <SettingsIcon name="reset-storage" size="1rem" />
                    {t('devtools.reset', 'Reset')}
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
                    <SettingsIcon name="reset-everything" size="1rem" />
                    {t('devtools.reset', 'Reset')}
                  </button>
                </div>
              {:else if optionsSpace === 'youtube-api'}
                <div class="devtools-option">
                  <span>{t('devtools.ignore.suffixes', 'Ignore Excluded Suffixes')}</span>
                  <button
                    type="button"
                    class="toggle-switch-mini"
                    class:active={ignoreExcludedSuffixes}
                    onclick={toggleIgnoreExcludedSuffixes}
                    aria-label="Toggle ignore excluded suffixes"
                  >
                    <span class="toggle-slider-mini"></span>
                  </button>
                </div>
              {/if}
            {/if}
          </div>
        </div>
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
  
  .options-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 150;
    background: var(--overlay-bg);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  @media (any-pointer: coarse) {
    .options-overlay {
      display: block;
    }
  }

  .options-menu {
    position: fixed;
    top: 5.15vmin;
    right: 1vmin;
    padding: 2vmin;
    border-radius: 1.2vmin;
    z-index: 200;
    color: var(--color-primary);
    background: var(--options-menu-bg);
    border: 0.1vmin solid color-mix(in srgb, var(--color-primary) 30%, transparent);
    width: 40vmin;
    min-height: 35vmin;
    transition: all 0.3s ease;
    box-shadow: 0 1vmin 3vmin rgba(0, 0, 0, 0.3);
    overflow: visible;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  :global([data-theme="cyber-neotic"]) .options-menu {
    background-image: 
      linear-gradient(var(--cyber-grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--cyber-grid-color) 1px, transparent 1px);
    background-size: 2vmin 2vmin;
    border-color: var(--color-primary);
    box-shadow: 
      0 0 2vmin color-mix(in srgb, var(--color-primary) 15%, transparent),
      inset 0 0 1.5vmin color-mix(in srgb, var(--color-primary) 5%, transparent);
    backdrop-filter: blur(15px) saturate(180%);
    -webkit-backdrop-filter: blur(15px) saturate(180%);
  }
  
  .options-menu h2 {
    font-family: 'Aileron';
    margin-top: 0;
    margin-bottom: 2vmin;
    font-size: 1.6rem;
    font-weight: 700;
    border-bottom: 0.1vmin solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    padding-bottom: 1vmin;
  }

  :global([data-theme="cyber-neotic"]) .options-menu h2 {
    text-shadow: 0 0 1.2vmin color-mix(in srgb, var(--color-primary) 60%, transparent);
    border-bottom-color: var(--color-primary);
  }

  :global([data-theme="cyber-neotic"]) .options-space-item:hover {
    background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
    box-shadow: 0 0 1.5vmin color-mix(in srgb, var(--color-primary) 10%, transparent);
    text-shadow: 0 0 0.8vmin var(--color-primary);
  }

  :global([data-theme="cyber-neotic"]) .options-back:hover {
    text-shadow: 0 0 0.8vmin var(--color-primary);
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2vmin;
    margin-bottom: 1.5vmin;
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: 1vmin;
    font-weight: 600;
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

  :global(.options-menu .theme-icon) {
    color: var(--color-primary);
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

  :global(.options-menu .color-scheme-icon) {
    color: var(--color-primary);
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
    padding: 0.6vmin 1.2vmin;
    border-radius: 0.5vmin;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.8vmin;
  }

  .reset-button:hover {
    background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
    transform: translateY(-0.1vmin);
    box-shadow: 0 0.2vmin 0.5vmin rgba(0, 0, 0, 0.2);
  }

  /* Workspace panel system */
  .options-workspace-viewport {
    width: 100%;
    position: relative;
    /* Clips horizontally but allows infinite vertical overflow for dropdowns */
    clip-path: inset(-100vh 0);
  }

  .options-panel-track {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .options-panel {
    width: calc(100% / 3);
    flex-shrink: 0;
    box-sizing: border-box;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    overflow: visible;
  }

  .options-panel.active {
    opacity: 1;
    pointer-events: all;
  }

  .options-space-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    color: var(--color-primary);
    padding: 1.5vmin 1.2vmin;
    cursor: pointer;
    font-family: inherit;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 0.8vmin;
    transition: all 0.2s;
    text-align: left;
    margin-bottom: 0.8vmin;
    line-height: 1;
  }

  .options-space-item:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
    padding-left: 1.5vmin;
  }

  .options-space-label {
    display: flex;
    align-items: center;
    gap: 1.5vmin;
  }

  :global(.options-menu .space-chevron) {
    opacity: 0.5;
    transition: transform 0.2s;
  }

  .options-space-item:hover :global(.space-chevron) {
    opacity: 1;
    transform: translateX(0.3vmin);
  }

  .options-back {
    display: inline-flex;
    align-items: center;
    gap: 0.8vmin;
    background: none;
    border: none;
    color: color-mix(in srgb, var(--color-primary) 70%, transparent);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.5vmin 0.8vmin;
    border-radius: 0.5vmin;
    margin-bottom: 1.5vmin;
    transition: all 0.2s;
  }

  .options-back:hover {
    color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .options-space-title {
    margin: 0 0 1.5vmin 0;
    padding: 0 0.5vmin;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-primary);
    border-bottom: 0.1vmin solid color-mix(in srgb, var(--color-primary) 15%, transparent);
    padding-bottom: 0.8vmin;
  }

  .environment-option {
    margin-top: 3vmin;
    margin-bottom: 0;
    justify-content: center;
  }

  .devtools-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 1.5vmin 0;
    padding: 0 0.5vmin;
    font-size: 0.95rem;
    font-weight: 500;
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
      top: 50%;
      left: 50%;
      right: auto;
      transform: translate(-50%, -50%);
      width: min(26rem, calc(100vw - 1.5rem));
      min-width: auto;
      max-width: none;
      padding: 1rem;
    }

    .options-overlay {
      display: block;
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
      top: 50%;
      left: 50%;
      right: auto;
      transform: translate(-50%, -50%);
      width: min(24rem, calc(100vw - 1.5rem));
    }

    .options-overlay {
      display: block;
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
      top: 50%;
      left: 50%;
      right: auto;
      transform: translate(-50%, -50%);
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

    .option-label span {
      font-size: 1rem;
    }

    .selector {
      width: 100%;
    }

    .switch-button,
    .options-space-item,
    .options-back,
    .theme-button,
    .color-scheme-button,
    .theme-option,
    .color-scheme-option,
    .reset-button,
    .confirm-btn {
      min-height: 2.9rem;
    }

    .switch-button,
    .options-space-item,
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
