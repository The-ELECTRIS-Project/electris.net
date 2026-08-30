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

  type OptionsSpace = 'appearance' | 'interface' | 'devtools' | 'site-data' | 'youtube-api' | 'orbit';

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
  let enableOrbit = $derived(modsState.config.site.enableOrbit);
  let textWrapSpacing = $derived(modsState.config.site.textWrapSpacing);
  let adaptiveOrbitColor = $derived(modsState.config.site.adaptiveOrbitColor);

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
      case 'orbit':
        return t('nav.options.space.orbit', 'Orbit');
    }
  }

  function toggleIgnoreExcludedSuffixes() {
    setIgnoreExcludedSuffixes(!ignoreExcludedSuffixes);
  }

  function toggleHideScrollbar() {
    modsState.updateSetting('site', 'hideScrollbar', !hideScrollbar);
    themeState.applyCurrentStyles();
  }

  function toggleEnableOrbit() {
    modsState.updateSetting('site', 'enableOrbit', !enableOrbit);
  }

  function toggleAdaptiveOrbitColor() {
    modsState.updateSetting('site', 'adaptiveOrbitColor', !adaptiveOrbitColor);
  }

  let activeKey = $state<string | null>(null);
  let keyPressTimeout: ReturnType<typeof setTimeout> | null = null;
  let holdCount = 0;

  function handleSliderInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    modsState.updateSetting('site', 'textWrapSpacing', val);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeKey === e.key) return;
      
      activeKey = e.key;
      const isIncrement = e.key === 'ArrowRight' || e.key === 'ArrowUp';
      holdCount = 0;
      
      stepValue(isIncrement, 0.01);
      clearTimers();
      
      const tick = (delay: number) => {
        keyPressTimeout = setTimeout(() => {
          holdCount++;
          const baseStep = 0.01;
          const acceleration = Math.min(0.04, Math.floor(holdCount / 5) * 0.01);
          stepValue(isIncrement, baseStep + acceleration);
          
          const nextDelay = Math.max(30, 100 - Math.floor(holdCount / 3) * 15);
          tick(nextDelay);
        }, delay);
      };
      
      tick(300);
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.key === activeKey) {
      clearTimers();
      activeKey = null;
    }
  }

  function clearTimers() {
    if (keyPressTimeout) {
      clearTimeout(keyPressTimeout);
      keyPressTimeout = null;
    }
  }

  function stepValue(increment: boolean, amount: number) {
    const currentVal = modsState.config.site.textWrapSpacing;
    const newVal = increment
      ? Math.min(1.0, currentVal + amount)
      : Math.max(0.1, currentVal - amount);
    const roundedVal = Math.round(newVal * 100) / 100;
    modsState.updateSetting('site', 'textWrapSpacing', roundedVal);
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
            <button
              type="button"
              class="options-space-item"
              onclick={(e) => openOptionsSpace('orbit', e)}
            >
              <div class="options-space-label">
                <SettingsIcon name="orbit" />
                <span>{t('nav.options.space.orbit', 'Orbit')}</span>
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
            {#if optionsSpace && (optionsSpace === 'appearance' || optionsSpace === 'interface' || optionsSpace === 'devtools' || optionsSpace === 'orbit')}
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
                <div class="option" title={t('nav.options.theme.tooltip', 'Choose a visual theme')}>
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

                <div class="option" title={t('nav.options.color.tooltip', 'Choose a color mode')}>
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
                <div class="option" title={t('nav.options.lang.tooltip', 'Change the site\'s language')}>
                  <div class="option-label">
                    <SettingsIcon name="language" size="1.1rem" />
                    <span>{t('nav.options.lang', 'Language')}</span>
                  </div>
                  <LanguageSelector />
                </div>
                <div class="option" title={t('nav.options.scrollbar.hide.tooltip', 'Show or hide the browser scrollbar')}>
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
              {:else if optionsSpace === 'orbit'}
                <div class="option" title={t('nav.options.orbit.enable.tooltip', 'Turn the Orbit cursor effect on or off')}>
                  <div class="option-label">
                    <SettingsIcon name="orbit" size="1.1rem" />
                    <span>{t('nav.options.orbit.enable', 'Enable Orbit')}</span>
                  </div>
                  <button
                    type="button"
                    class="toggle-switch-mini"
                    class:active={enableOrbit}
                    onclick={toggleEnableOrbit}
                    aria-label="Toggle enable orbit"
                  >
                    <span class="toggle-slider-mini"></span>
                  </button>
                </div>
                <div class="option" title={t('nav.options.orbit.adaptive.tooltip', 'Toggle Orbit color adaptation to text')}>
                  <div class="option-label">
                    <SettingsIcon name="color" size="1.1rem" />
                    <span>{t('nav.options.orbit.adaptive', 'Adaptive Colour')}</span>
                  </div>
                  <button
                    type="button"
                    class="toggle-switch-mini"
                    class:active={adaptiveOrbitColor}
                    onclick={toggleAdaptiveOrbitColor}
                    aria-label="Toggle adaptive orbit color"
                  >
                    <span class="toggle-slider-mini"></span>
                  </button>
                </div>
                <div class="option" title={t('nav.options.orbit.spacing.tooltip', 'Space between text and border when hovering words')}>
                  <div class="option-label">
                    <SettingsIcon name="text-spacing" size="1.1rem" />
                    <span>{t('nav.options.orbit.spacing', 'Text Wrap Spacing')}</span>
                  </div>
                  <div class="slider-container">
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.01"
                      value={textWrapSpacing}
                      oninput={handleSliderInput}
                      onkeydown={handleKeyDown}
                      onkeyup={handleKeyUp}
                      class="spacing-slider"
                      aria-label="Text Wrap Spacing"
                    />
                    <span class="slider-value">{textWrapSpacing.toFixed(2)}</span>
                  </div>
                </div>
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
                <div class="devtools-option" title={t('devtools.ignore.suffixes.tooltip', 'Show excluded videos like streams and VODs in video cards')}>
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
      <ul style="text-align: left; margin: var(--space-3) 0; padding-left: var(--space-5);">
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
      <ul style="text-align: left; margin: var(--space-3) 0; padding-left: var(--space-5);">
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
    height: var(--layout-nav-height);
    padding: 0 var(--space-3);
    display: flex;
    align-items: center;
    z-index: var(--z-nav);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .nav-buttons {
    position: fixed;
    display: flex;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    gap: var(--space-4);
  }

  .nav-button {
    font-family: var(--font-ui);
    text-decoration: none;
    font-size: var(--text-lg);
    white-space: nowrap;
  }

  .hamburger {
    position: fixed;
    top: 0;
    left: 0;
    width: 15rem;
    height: 100vh;
    max-width: 80%;
    transform: translateX(-100%);
    transition: transform var(--duration-slow) var(--ease-out);
    z-index: var(--z-sticky);
    padding: var(--space-4);
    padding-top: var(--space-7);
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
    font-family: var(--font-ui);
    font-size: var(--text-sm);
    border-top: 1px solid;
    padding-top: var(--space-3);
  }

  .hamburger-footer a {
    font-size: var(--text-base);
  }

  .hamburger.open {
    transform: translateX(0);
  }

  .settings-button {
    position: fixed;
    right: var(--space-3);
    user-select: none;
    background: none;
    border: none;
    cursor: pointer;
  }

  .settings-icon {
    user-select: none;
    height: var(--space-6);
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
    z-index: var(--z-overlay);
    background: var(--scrim-page);
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
    top: calc(var(--layout-nav-height) + var(--space-2));
    right: var(--space-3);
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    z-index: calc(var(--z-overlay) + 1);
    color: var(--text-primary);
    background: var(--surface-overlay);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    width: min(30rem, calc(100vw - var(--space-6)));
    min-height: 25rem;
    transition: var(--transition-colors);
    box-shadow: var(--shadow-lg);
    overflow: visible;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  :global([data-theme="cyber-neotic"]) .options-menu {
    background-image: 
      linear-gradient(var(--cyber-grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--cyber-grid-color) 1px, transparent 1px);
    background-size: 1.5rem 1.5rem;
    border-color: var(--accent);
    box-shadow: 
      0 0 1.5rem color-mix(in srgb, var(--accent) 15%, transparent),
      inset 0 0 1.1rem color-mix(in srgb, var(--accent) 5%, transparent);
    backdrop-filter: blur(15px) saturate(180%);
    -webkit-backdrop-filter: blur(15px) saturate(180%);
  }
  
  .options-menu h2 {
    font-family: var(--font-ui);
    margin-top: 0;
    margin-bottom: var(--space-5);
    font-size: var(--text-xl);
    font-weight: 700;
    border-bottom: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    padding-bottom: var(--space-3);
  }

  :global([data-theme="cyber-neotic"]) .options-menu h2 {
    text-shadow: 0 0 0.9rem color-mix(in srgb, var(--accent) 60%, transparent);
    border-bottom-color: var(--accent);
  }

  :global([data-theme="cyber-neotic"]) .options-space-item:hover {
    background-color: color-mix(in srgb, var(--accent) 15%, transparent);
    box-shadow: 0 0 1.1rem color-mix(in srgb, var(--accent) 10%, transparent);
    text-shadow: 0 0 0.6rem var(--accent);
  }

  :global([data-theme="cyber-neotic"]) .options-back:hover {
    text-shadow: 0 0 0.6rem var(--accent);
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: var(--space-5);
    margin-bottom: var(--space-4);
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-weight: 600;
  }

  .switch-button {
    margin-top: var(--space-5);
    display: inline-block;
    padding: var(--space-1) var(--space-2);
    border: 2px solid var(--accent);
    border-radius: var(--radius-sm);
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: var(--transition-colors);
  }

  .switch-button:hover {
    border-color: var(--accent-hover);
    background: color-mix(in srgb, var(--accent) 25%, transparent);
  }

  .selector {
    position: relative;
    display: inline-block;
    width: 13rem;
  }

  /* Theme Selector Styles */

  .theme-button {
    background: none;
    border: 1px solid var(--accent);
    color: var(--text-primary);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-xs);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: background-color var(--duration-normal) var(--ease-out);
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .theme-button:hover {
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  :global(.options-menu .theme-icon) {
    color: var(--text-primary);
  }

  .theme-name {
    font-size: var(--text-sm);
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .dropdown-arrow {
    font-size: var(--text-xs);
    transition: transform var(--duration-normal) var(--ease-out);
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
    background: var(--surface-sunken);
    border: 1px solid;
    border-radius: var(--radius-xs);
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    z-index: var(--z-raised);
    max-height: 15rem;
    overflow-y: auto;
    box-shadow: var(--shadow-sm);
    box-sizing: border-box;
  }

  .theme-option {
    width: 100%;
    background: none;
    border: none;
    color: var(--text-primary);
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: background-color var(--duration-normal) var(--ease-out);
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
    min-height: 2.5rem;
  }

  .theme-option:hover {
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .theme-option.active {
    background-color: color-mix(in srgb, var(--accent) 20%, transparent);
    font-weight: 500;
  }

  .theme-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .theme-option .theme-name {
    font-size: var(--text-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .theme-description {
    font-size: var(--text-2xs);
    color: color-mix(in srgb, var(--text-primary) 70%, transparent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  .color-scheme-button {
    background: none;
    border: 1px solid var(--accent);
    color: var(--text-primary);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-xs);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: background-color var(--duration-normal) var(--ease-out);
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .color-scheme-button:hover {
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  :global(.options-menu .color-scheme-icon) {
    color: var(--text-primary);
  }

  .color-scheme-name {
    font-size: var(--text-sm);
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
    background: var(--surface-sunken);
    border: 1px solid;
    border-radius: var(--radius-xs);
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    z-index: var(--z-raised);
    max-height: 15rem;
    overflow-y: auto;
    box-shadow: var(--shadow-sm);
    box-sizing: border-box;
  }

  .color-scheme-option {
    width: 100%;
    background: none;
    border: none;
    color: var(--text-primary);
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: background-color var(--duration-normal) var(--ease-out);
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
    min-height: 2.5rem;
  }

  .color-scheme-option:hover {
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .color-scheme-option.active {
    background-color: color-mix(in srgb, var(--accent) 20%, transparent);
    font-weight: 500;
  }

  .color-scheme-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .color-scheme-option .color-scheme-name {
    font-size: var(--text-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .color-scheme-description {
    font-size: var(--text-2xs);
    color: color-mix(in srgb, var(--text-primary) 70%, transparent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  .checkmark {
    color: var(--text-primary);
    font-weight: bold;
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .menu-item {
    margin-top: var(--space-3);
    margin-bottom: var(--space-3);
    display: flex;
    flex-direction: column;
    justify-content: left;
  }

  .menu-item a {
    display: inline-block;
    line-height: 1.4;
    font-family: var(--font-ui);
    text-decoration: none;
    color: var(--text-primary);
    font-size: var(--text-lg);
  }

  .env-indicator {
    margin-left: var(--space-2);
    color: var(--text-primary);
    font-size: var(--text-xs);
    letter-spacing: 0.03em;
    background-color: color-mix(in srgb, var(--accent) 20%, transparent);
    padding: 0.1rem 0.3rem;
    border-radius: var(--radius-xs);
    font-family: monospace;
  }

  .footer span {
    font-family: var(--font-body);
    font-weight: 300;
  }

  .reset-button {
    background: none;
    width: auto;
    border: 1px solid var(--accent);
    color: var(--text-primary);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--text-sm);
    font-weight: 600;
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .reset-button:hover {
    background-color: color-mix(in srgb, var(--accent) 15%, transparent);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
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
    transition: transform var(--duration-slow) var(--ease-in-out);
  }

  .options-panel {
    width: calc(100% / 3);
    flex-shrink: 0;
    box-sizing: border-box;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--duration-slow) var(--ease-out);
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
    color: var(--text-primary);
    padding: var(--space-4) var(--space-3);
    cursor: pointer;
    font-family: inherit;
    font-size: var(--text-md);
    font-weight: 700;
    border-radius: var(--radius-sm);
    transition:
      var(--transition-colors),
      padding-left var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      text-shadow var(--duration-normal) var(--ease-out);
    text-align: left;
    margin-bottom: var(--space-2);
    line-height: 1;
  }

  .options-space-item:hover {
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
    padding-left: var(--space-4);
  }

  .options-space-label {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  :global(.options-menu .space-chevron) {
    opacity: 0.5;
    transition: transform var(--duration-normal) var(--ease-out);
  }

  .options-space-item:hover :global(.space-chevron) {
    opacity: 1;
    transform: translateX(0.2rem);
  }

  .options-back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    background: none;
    border: none;
    color: color-mix(in srgb, var(--text-primary) 70%, transparent);
    cursor: pointer;
    font-family: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    padding: var(--space-2);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-4);
    transition:
      var(--transition-colors),
      text-shadow var(--duration-normal) var(--ease-out);
  }

  .options-back:hover {
    color: var(--text-primary);
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .options-space-title {
    margin: 0 0 var(--space-4);
    padding: 0 var(--space-2);
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--text-primary);
    border-bottom: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
    padding-bottom: var(--space-2);
  }

  .environment-option {
    margin-top: var(--space-6);
    margin-bottom: 0;
    justify-content: center;
  }

  .devtools-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: var(--space-4) 0;
    padding: 0 var(--space-2);
    font-size: var(--text-sm);
    font-weight: 500;
  }

  .devtools-option span {
    color: color-mix(in srgb, var(--text-primary) 90%, transparent);
  }

  .toggle-switch-mini {
    position: relative;
    width: 2.5rem;
    height: 1.25rem;
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: var(--transition-colors);
    padding: 0;
  }

  .toggle-switch-mini.active {
    background: var(--accent);
    border-color: var(--accent);
  }

  .toggle-slider-mini {
    position: absolute;
    top: 0.175rem;
    left: 0.175rem;
    width: 0.9rem;
    height: 0.9rem;
    background: white;
    border-radius: var(--radius-round);
    transition: transform var(--duration-slow) var(--ease-in-out);
  }

  .toggle-switch-mini.active .toggle-slider-mini {
    transform: translateX(1.25rem);
  }

  @media (any-pointer: coarse) {
    .toggle-switch-mini {
      width: 2.8rem;
      height: 1.6rem;
      border-radius: var(--radius-pill);
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
    background: var(--scrim-page);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-popup);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .confirm-dialog {
    background: var(--surface-page);
    border: 2px solid var(--accent);
    border-radius: var(--radius-md);
    padding: var(--space-5);
    width: min(22rem, calc(100vw - var(--space-6)));
    text-align: center;
    color: var(--text-primary);
  }

  .confirm-dialog h3 {
    margin: 0 0 var(--space-3);
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  .confirm-dialog p {
    margin: var(--space-3) 0;
    line-height: 1.6;
    color: inherit;
  }

  .cookie-stats {
    margin: var(--space-3) 0;
    padding: var(--space-2);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-radius: var(--radius-xs);
  }

  .cookie-stats small {
    color: color-mix(in srgb, var(--text-primary) 80%, transparent);
    font-family: monospace;
  }

  .confirm-buttons {
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    margin-top: var(--space-4);
  }

  .confirm-btn {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-xs);
    cursor: pointer;
    font-size: var(--text-sm);
    font-weight: 500;
    transition: var(--transition-colors);
    border: 1px solid;
  }

  .confirm-cancel {
    background: none;
    border-color: var(--text-muted);
    color: var(--text-muted);
  }

  .confirm-cancel:hover {
    background-color: color-mix(in srgb, var(--text-muted) 10%, transparent);
    border-color: var(--text-secondary);
    color: var(--text-secondary);
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

  .slider-container {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 1;
    min-width: 0;
  }

  .slider-value {
    font-family: monospace;
    font-size: var(--text-sm);
    font-weight: 600;
    min-width: 3.2ch;
    text-align: right;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  .spacing-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 7rem;
    height: 0.35rem;
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    outline: none;
    transition: background-color var(--duration-normal) var(--ease-out);
    flex-shrink: 1;
    min-width: 0;
  }

  .spacing-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 0.35rem;
    cursor: pointer;
  }

  .spacing-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1.2rem;
    height: 0.75rem;
    border-radius: var(--radius-pill);
    background: var(--accent);
    cursor: pointer;
    box-shadow: 0 0 0.45rem color-mix(in srgb, var(--accent) 30%, transparent);
    transition: transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
    margin-top: -0.2rem;
  }

  .spacing-slider::-moz-range-thumb {
    width: 1.2rem;
    height: 0.75rem;
    border-radius: var(--radius-pill);
    background: var(--accent);
    cursor: pointer;
    box-shadow: 0 0 0.45rem color-mix(in srgb, var(--accent) 30%, transparent);
    transition: transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
    border: none;
  }

  .spacing-slider:hover::-webkit-slider-thumb,
  .spacing-slider:focus::-webkit-slider-thumb {
    transform: scale(1.15);
    box-shadow: 0 0 0.75rem var(--accent);
  }

  .spacing-slider:hover::-moz-range-thumb,
  .spacing-slider:focus::-moz-range-thumb {
    transform: scale(1.15);
    box-shadow: 0 0 0.75rem var(--accent);
  }

  @media (max-width: 900px) {
    .navbar {
      height: auto;
      padding: calc(env(safe-area-inset-top) + 0.9rem) var(--space-4) 0.9rem;
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
      width: min(26rem, calc(100vw - var(--space-5)));
      min-width: auto;
      max-width: none;
      padding: var(--space-4);
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
      width: min(24rem, calc(100vw - var(--space-5)));
    }

    .options-overlay {
      display: block;
    }

    .option {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-3);
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
      padding: calc(env(safe-area-inset-top) + 0.85rem) var(--space-4) 0.85rem;
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
      font-size: var(--text-lg);
      padding: 0.45rem 0;
    }

    .hamburger-footer {
      font-size: var(--text-base);
      padding-top: var(--space-4);
    }

    .settings-button {
      min-width: var(--touch-target-size);
      min-height: var(--touch-target-size);
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
      min-width: min(28rem, calc(100vw - var(--space-5)));
      max-width: min(30rem, calc(100vw - var(--space-5)));
      padding: var(--space-4);
    }

    .options-menu h2 {
      font-size: var(--text-xl);
    }

    .option {
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .option-label span {
      font-size: var(--text-base);
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
      min-height: var(--touch-target-size);
    }

    .switch-button,
    .options-space-item,
    .theme-button,
    .color-scheme-button {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
    }

    .theme-option,
    .color-scheme-option {
      padding: 0.85rem var(--space-4);
      gap: var(--space-3);
      min-height: 3.25rem;
    }

    .theme-name,
    .color-scheme-name {
      font-size: var(--text-base);
    }

    .theme-description,
    .color-scheme-description {
      font-size: var(--text-sm);
    }

    .dropdown-arrow,
    .checkmark {
      font-size: var(--text-sm);
    }

    .devtools-option {
      gap: var(--space-3);
      align-items: flex-start;
    }

    .confirm-dialog {
      width: min(24rem, calc(100vw - var(--space-5)));
      padding: var(--space-5);
      border-radius: var(--radius-lg);
    }

    .confirm-buttons {
      flex-direction: column;
    }

    .confirm-btn {
      width: 100%;
      padding: 0.85rem var(--space-4);
      border-radius: var(--radius-md);
    }
  }
</style>
