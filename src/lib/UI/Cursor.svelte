<script lang="ts">
  import { onMount } from "svelte";
  import { afterNavigate } from '$app/navigation';
  import { hoverConfigStore, type HoverConfig } from '$lib/stores/hoverConfig';

  let circleElement: HTMLElement | null = null;

  const mouse = { x: 0, y: 0 };
  const previousMouse = { x: 0, y: 0 };
  const circle = { x: 0, y: 0 };
  let currentScale = 0;
  let currentAngle = 0;

  let isTouchActive = false;
  let touchVisibility = 1;
  let isTouchDevice = false;

  let isNavigating = false;

  let lockedElement: HTMLElement | null = null;
  let lockedConfig: HoverConfig | null = null;
  let isTransitioning = false;
  let transitionStartTime = 0;
  let wasLocked = false;
  let lastLockedConfig: HoverConfig | null = null;

  let currentWord: { element: HTMLElement, bounds: DOMRect, text: string } | null = null;
  let wordHoverPadding = 0.8;

  let hoverConfigs: HoverConfig[] = [];
  const hoveredElements = new Set<HTMLElement>();
  let lastColorElement: HTMLElement | null = null;

  function updateCursorColor(element: HTMLElement | null, config?: HoverConfig) {
    if (!circleElement) return;

    if (element && config?.wrapText) {
      if (lastColorElement === element) return;
      lastColorElement = element;
      const color = window.getComputedStyle(element).color;
      circleElement.style.borderColor = color;
    } else {
      if (lastColorElement === null) return;
      lastColorElement = null;
      circleElement.style.borderColor = '';
    }
  }
  
  function vminToPx(vmin: number): number {
    return (vmin / 100) * Math.min(window.innerHeight, window.innerWidth);
  }

  function hasNoInteractClass(element: HTMLElement, checkAll: boolean = false): boolean {
    const classToCheck = checkAll ? 'circle-no-interact-all' : 'circle-no-interact';
    
    if (element.classList.contains('circle-no-interact') || element.classList.contains('circle-no-interact-all')) {
      return true;
    }
    
    let parent = element.parentElement;
    while (parent) {
      if (parent.classList.contains('circle-no-interact-all')) {
        return true;
      }
      parent = parent.parentElement;
    }
    
    return false;
  }

  function hasNoWrapClass(element: HTMLElement): boolean {
    if (element.classList.contains('wrap-no-interact') || element.classList.contains('wrap-no-interact-all')) {
      return true;
    }
    
    let parent = element.parentElement;
    while (parent) {
      if (parent.classList.contains('wrap-no-interact-all')) {
        return true;
      }
      parent = parent.parentElement;
    }
    
    return false;
  }

  function getWordAtPosition(x: number, y: number, wrapConfig: HoverConfig['wrapText'], targetElement?: HTMLElement): { element: HTMLElement, bounds: DOMRect, text: string } | null {
    if (!wrapConfig) return null;
    
    const words = wrapConfig.words ?? false;
    const sentences = wrapConfig.sentences ?? false;
    
    if (words === false && sentences === false) {
      return null;
    }
    
    const ignorePunctuation = wrapConfig.ignorePunctuation ?? false;
    const ignoreCharacters = wrapConfig.ignoreCharacters ?? false;
    
    if (words && sentences) {
      console.error('wrapText cannot have both words and sentences set to true');
      return null;
    }
    
    if (!words && !sentences) {
      return null;
    }
    
    const elements = document.elementsFromPoint(x, y);
    
    for (const element of elements) {
      const textElement = element as HTMLElement;
      
      if (hasNoWrapClass(textElement)) {
        continue;
      }
      
      if (targetElement && !targetElement.contains(textElement) && targetElement !== textElement) {
        continue;
      }
      
      if (!isTextElement(textElement)) continue;
      
      if (sentences) {
        const rect = textElement.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          const text = textElement.textContent?.trim() || '';
          if (text.length > 0) {
            return {
              element: textElement,
              bounds: rect,
              text: text
            };
          }
        }
      } else if (words) {
        const textNodes = getTextNodes(textElement);
        for (const textNode of textNodes) {
          const word = getWordFromTextNode(textNode, x, y, { ignorePunctuation, ignoreCharacters });
          if (word) {
            return word;
          }
        }
      }
    }
    return null;
  }

  function isTextElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const textTags = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'time'];
    const hasTextClass = element.classList.contains('time') || element.classList.contains('date');
    
    return textTags.includes(tagName) || hasTextClass;
  }

  function getTextNodes(element: HTMLElement): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const text = node.textContent?.trim();
          return text && text.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }
    return textNodes;
  }

  function getWordFromTextNode(textNode: Text, x: number, y: number, filterConfig: { ignorePunctuation: boolean, ignoreCharacters: boolean }): { element: HTMLElement, bounds: DOMRect, text: string } | null {
    const text = textNode.textContent || '';
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) return null;

    const range = document.createRange();
    let currentIndex = 0;

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      const wordStart = text.indexOf(word, currentIndex);
      let wordEnd = wordStart + word.length;
      
      if (filterConfig.ignorePunctuation || filterConfig.ignoreCharacters) {
        let cleanWord = word;
        let actualStart = wordStart;
        let actualEnd = wordEnd;
        
        if (filterConfig.ignorePunctuation && filterConfig.ignoreCharacters) {
          const match = word.match(/[\p{L}\p{N}]+/u);
          if (match) {
            cleanWord = match[0];
            const cleanStart = word.indexOf(cleanWord);
            actualStart = wordStart + cleanStart;
            actualEnd = actualStart + cleanWord.length;
          } else {
            currentIndex = wordEnd;
            continue;
          }
        } else if (filterConfig.ignorePunctuation) {
          const match = word.match(/[\p{L}\p{N}\s\[\]{}|\\\/\-_+=<>~`@#$%^&*()'"”]+/u);
          if (match) {
            cleanWord = match[0];
            const cleanStart = word.indexOf(cleanWord);
            actualStart = wordStart + cleanStart;
            actualEnd = actualStart + cleanWord.length;
          }
        } else if (filterConfig.ignoreCharacters) {
          const match = word.match(/[\p{L}\p{N}.,;:!?"'()-]+/u);
          if (match) {
            cleanWord = match[0];
            const cleanStart = word.indexOf(cleanWord);
            actualStart = wordStart + cleanStart;
            actualEnd = actualStart + cleanWord.length;
          }
        }
        
        range.setStart(textNode, actualStart);
        range.setEnd(textNode, actualEnd);
      } else {
        range.setStart(textNode, wordStart);
        range.setEnd(textNode, wordEnd);
      }
      
      const rect = range.getBoundingClientRect();
      
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const parentElement = textNode.parentElement as HTMLElement;
        return {
          element: parentElement,
          bounds: rect,
          text: range.toString()
        };
      }
      
      currentIndex = wordEnd;
    }

    return null;
  }

  function getWordHoverBounds(): { x: number, y: number, width: number, height: number } {
    if (!currentWord) {
      return { x: circle.x, y: circle.y, width: vminToPx(2), height: vminToPx(2) };
    }

    const padding = vminToPx(wordHoverPadding);
    return {
      x: currentWord.bounds.left + currentWord.bounds.width / 2,
      y: currentWord.bounds.top + currentWord.bounds.height / 2,
      width: currentWord.bounds.width + padding * 2,
      height: currentWord.bounds.height + padding * 2
    };
  }

  function shouldAllowRotation(): boolean {
    if (!circleElement) return true;
    if (isTransitioning) return false;
    if (lockedConfig?.preventRotation) return false;
    
    if (lockedElement) return false;

    return true;
  }

  function handleTouchStart(e: TouchEvent) {
    isTouchActive = true;
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
  }

  function handleTouchMove(e: TouchEvent) {
    isTouchActive = true;
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
  }

  function handleTouchEnd(e: TouchEvent) {
    isTouchActive = false;
  }

  function getTrackingElement(element: HTMLElement, config: HoverConfig): HTMLElement {
    if (config.trackingTarget) {
      const target = element.querySelector(config.trackingTarget) as HTMLElement;
      if (target) return target;
    }
    return element;
  }

  function getTargetCenter(element: HTMLElement, config: HoverConfig): { x: number, y: number, width?: number, height?: number } {
    if (config.wrapText && currentWord) {
      const bounds = getWordHoverBounds();
      return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    }

    let target = getTrackingElement(element, config);
    let offsetX = 0;
    let offsetY = 0;

    if (config.customPositioning) {
      const customTarget = document.querySelector(config.customPositioning.targetSelector) as HTMLElement;
      if (customTarget) {
        target = customTarget;
      }
      offsetX = config.customPositioning.offsetX ? vminToPx(config.customPositioning.offsetX * 1.77) : 0;
      offsetY = config.customPositioning.offsetY ? vminToPx(config.customPositioning.offsetY) : 0;
    }

    let rect = target.getBoundingClientRect();
    
    // Safety check. If tracked element has no size (not rendered yet), fallback to the locked element
    if (rect.width === 0 && rect.height === 0 && target !== element) {
        target = element;
        rect = target.getBoundingClientRect();
    }

    let centerX = rect.left + rect.width / 2 + offsetX;
    let centerY = rect.top + rect.height / 2 + offsetY;

    return { x: centerX, y: centerY, width: rect.width, height: rect.height };
  }

  function dispatchCustomEvent(eventName: string, element: HTMLElement, config?: HoverConfig, index?: number) {
    if (!config) return;
    const center = getTargetCenter(element, config);
    const detail: any = { x: center.x, y: center.y };
    if (index !== undefined) {
      detail.index = index;
    }
    
    window.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true
    }));
  }

  function elementMatchesConfig(target: HTMLElement, config: HoverConfig): { matches: boolean, element: HTMLElement | null } {
    if (hasNoInteractClass(target)) {
      return { matches: false, element: null };
    }

    if (config.type && config.type.length > 0) {
      const elementTagName = target.tagName.toLowerCase();
      const matchesType = config.type.some(type => type.toLowerCase() === elementTagName);
      if (!matchesType) {
        return { matches: false, element: null };
      }
    }

    if (config.requireAllSelectors) {
      const matchesAll = config.selectors.every(selector => {
        const matchedElement = target.closest(selector);
        return matchedElement && !hasNoInteractClass(matchedElement as HTMLElement);
      });
      if (matchesAll) {
        const element = target.closest(config.selectors[0]) as HTMLElement;
        if (element && !hasNoInteractClass(element)) {
          return { matches: true, element };
        }
      }
      return { matches: false, element: null };
    } else {
      const matchedSelector = config.selectors.find(selector => {
        const matchedElement = target.closest(selector);
        return matchedElement && !hasNoInteractClass(matchedElement as HTMLElement);
      });
      if (matchedSelector) {
        const element = target.closest(matchedSelector) as HTMLElement;
        if (element && !hasNoInteractClass(element)) {
          return { matches: true, element };
        }
      }
      return { matches: false, element: null };
    }
  }

  function getApplicableConfigsForPosition(x: number, y: number): { config: HoverConfig, element: HTMLElement }[] {
    const elements = document.elementsFromPoint(x, y);
    const configElementPairs: { config: HoverConfig, element: HTMLElement }[] = [];

    for (const el of elements) {
      const htmlElement = el as HTMLElement;
      
      if (hasNoInteractClass(htmlElement)) {
        continue;
      }

      for (const config of hoverConfigs) {
        const matchResult = elementMatchesConfig(htmlElement, config);
        if (matchResult.matches && matchResult.element) {
          configElementPairs.push({
            config,
            element: matchResult.element
          });
        }
      }
    }

    const elementsWithCustomOverrides = new Set<HTMLElement>();
    
    configElementPairs.forEach(({ config, element }) => {
      // If it's a custom config (has type OR it's not one of the broad defaults)
      const isDefault = config.selectors.length >= 7 && config.selectors.includes('a') && config.selectors.includes('p');
      if ((config.type && config.type.length > 0) || !isDefault) {
        elementsWithCustomOverrides.add(element);
      }
    });

    const filteredPairs = configElementPairs.filter(({ config, element }) => {
      const isDefault = config.selectors.length >= 7 && config.selectors.includes('a') && config.selectors.includes('p');
      if ((config.type && config.type.length > 0) || !isDefault) {
        return true;
      }
      const hasDescendantWithOverride = Array.from(elementsWithCustomOverrides).some(overrideElement => {
        return element.contains(overrideElement) && element !== overrideElement;
      });

      return !hasDescendantWithOverride;
    });

    return filteredPairs;
  }

  function getApplicableConfigsForTarget(target: HTMLElement): { config: HoverConfig, element: HTMLElement }[] {
    const configElementPairs: { config: HoverConfig, element: HTMLElement }[] = [];

    for (const config of hoverConfigs) {
      const matchResult = elementMatchesConfig(target, config);
      if (matchResult.matches && matchResult.element) {
        configElementPairs.push({
          config,
          element: matchResult.element
        });
      }
    }

    const elementsWithCustomOverrides = new Set<HTMLElement>();
    
    configElementPairs.forEach(({ config, element }) => {
      const isDefault = config.selectors.length >= 7 && config.selectors.includes('a') && config.selectors.includes('p');
      if ((config.type && config.type.length > 0) || !isDefault) {
        elementsWithCustomOverrides.add(element);
      }
    });

    const filteredPairs = configElementPairs.filter(({ config, element }) => {
      const isDefault = config.selectors.length >= 7 && config.selectors.includes('a') && config.selectors.includes('p');
      if ((config.type && config.type.length > 0) || !isDefault) {
        return true;
      }
      const hasDescendantWithOverride = Array.from(elementsWithCustomOverrides).some(overrideElement => {
        return element.contains(overrideElement) && element !== overrideElement;
      });

      return !hasDescendantWithOverride;
    });

    return filteredPairs;
  }

  function hasEnabledWrapText(config: HoverConfig): boolean {
    if (!config.wrapText) return false;
    const words = config.wrapText.words ?? false;
    const sentences = config.wrapText.sentences ?? false;
    return words || sentences;
  }

  function getWordAtPositionWithHierarchy(x: number, y: number): { element: HTMLElement, bounds: DOMRect, text: string, config: HoverConfig } | null {
    const applicableConfigs = getApplicableConfigsForPosition(x, y);
    
    // Sort configs so that more specific ones (like those with 'type' or more specific selectors) come first
    const sortedConfigs = applicableConfigs.sort((a, b) => {
      const aIsCustom = (a.config.type && a.config.type.length > 0) ? 1 : 0;
      const bIsCustom = (b.config.type && b.config.type.length > 0) ? 1 : 0;
      
      if (aIsCustom !== bIsCustom) return bIsCustom - aIsCustom;

      // If both or neither have custom types, prioritize based on wrapText presence and specificity
      const aHasWrap = a.config.wrapText ? 1 : 0;
      const bHasWrap = b.config.wrapText ? 1 : 0;
      return bHasWrap - aHasWrap;
    });

    for (const { config, element } of sortedConfigs) {
      if (!hasEnabledWrapText(config)) continue;
      
      const word = getWordAtPosition(x, y, config.wrapText, element);
      if (word) {
        return {
          ...word,
          config
        };
      }
    }

    return null;
  }

  function handleWordHover() {
    const wordResult = getWordAtPositionWithHierarchy(mouse.x, mouse.y);
    
    if (!wordResult) {
      if (currentWord) {
        if (hoveredElements.has(currentWord.element)) {
          hoveredElements.delete(currentWord.element);
          
          const currentConfigClass = hoverConfigs.find(config => 
            config.wrapText && ((config.wrapText.words ?? false) || (config.wrapText.sentences ?? false)) && 
            circleElement?.classList.contains(config.className)
          )?.className;
          
          if (currentConfigClass) {
            circleElement?.classList.remove(currentConfigClass);
          }
          
          if (!lockedConfig || !lockedConfig.lockPosition || lockedConfig.wrapText) {
             lockedElement = null;
             lockedConfig = null;
             wasLocked = true;
             isTransitioning = true;
             transitionStartTime = performance.now();
             circleElement?.classList.remove('hovered-lock');
             
             updateCursorColor(null);
             
             if (circleElement) {
                circleElement.style.width = '';
                circleElement.style.height = '';
             }
          }
        }
        currentWord = null;
      }
      return;
    }
    
    const { element, bounds, text, config } = wordResult;
    const isNewWord = !currentWord || 
      currentWord.text !== text || 
      Math.abs(currentWord.bounds.left - bounds.left) > 1;
    
    if (isNewWord) {
      if (currentWord && hoveredElements.has(currentWord.element)) {
        hoveredElements.delete(currentWord.element);
        const currentConfigClass = hoverConfigs.find(c => 
          c.wrapText && circleElement?.classList.contains(c.className)
        )?.className;
        if (currentConfigClass) {
          circleElement?.classList.remove(currentConfigClass);
        }
      }
      
      currentWord = { element, bounds, text };
      
      if (!hoveredElements.has(element)) {
        hoveredElements.add(element);
        circleElement?.classList.add(config.className);
        
        lockedElement = element;
        lockedConfig = config;
        
        isTransitioning = true;
        transitionStartTime = performance.now();
        
        circleElement?.classList.add('hovered-lock');

        updateCursorColor(element, config);
      }
    }
  }

  function handleHover(event: MouseEvent, config: HoverConfig) {
    const target = event.target as HTMLElement;

    if (hasNoInteractClass(target)) {
      return;
    }

    if (config.wrapText) {
      return;
    }

    const matchResult = elementMatchesConfig(target, config);

    if (!matchResult.matches || !matchResult.element) return;

    const element = matchResult.element;

    const applicableConfigs = getApplicableConfigsForTarget(target);
    const isApplicable = applicableConfigs.some(({ config: applicableConfig, element: applicableElement }) => 
      applicableConfig === config && applicableElement === element
    );
    
    if (!isApplicable) return;
    if (hoveredElements.has(element)) return;

    hoveredElements.add(element);
    circleElement?.classList.add(config.className);

    updateCursorColor(element, config);

    if (config.lockPosition) {
      lockedElement = element;
      lockedConfig = config;
      
      if (!circleElement?.classList.contains('hovered-lock')) {
        isTransitioning = true;
        transitionStartTime = performance.now();
      }
      
      circleElement?.classList.add('hovered-lock');
    }

    if (config.customEvent) {
      dispatchCustomEvent(config.customEvent.hovered, element, config);
    }

    lastLockedConfig = config.lockPosition ? config : null;
  }

  function handleUnhover(event: MouseEvent, config: HoverConfig) {
    const target = event.target as HTMLElement;
    const relatedTarget = event.relatedTarget as Node | null;
    
    if (config.wrapText) {
      return;
    }

    const matchResult = elementMatchesConfig(target, config);

    if (!matchResult.matches || !matchResult.element) return;

    const element = matchResult.element;
    
    if (relatedTarget && element.contains(relatedTarget)) {
      return;
    }
    
    if (!hoveredElements.has(element)) return;

    hoveredElements.delete(element);
    circleElement?.classList.remove(config.className);

    if (config.lockPosition) {
        if (lockedElement === element) {
            lockedElement = null;
            lockedConfig = null;
            wasLocked = true;
            isTransitioning = true;
            transitionStartTime = performance.now();
            circleElement?.classList.remove('hovered-lock');
            
            updateCursorColor(null);
        }
    }

    if (config.customEvent) {
      window.dispatchEvent(new CustomEvent(config.customEvent.unhovered, {
        bubbles: true
      }));
    }
  }

  function setupHoverDetection() {
    const handleMouseOver = (event: MouseEvent) => {
      hoverConfigs.forEach((config) => {
        handleHover(event, config);
      });
    };

    const handleMouseOut = (event: MouseEvent) => {
      hoverConfigs.forEach(config => {
        handleUnhover(event, config);
      });
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }

  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
  
    const isClickingHoverableElement = hoverConfigs.some(config => {
      const matchResult = elementMatchesConfig(target, config);
      return matchResult.matches;
    });
  
    if (!isClickingHoverableElement) {
      softResetCursor();
    }
  }

  function softResetCursor(force = false) {
    if (circleElement) {
      const elementsAtPoint = document.elementsFromPoint(mouse.x, mouse.y);
      const isOverNavbar = elementsAtPoint.some(el => el.closest('.navbar'));

      if (!force && isOverNavbar) {
        return;
      }

      hoveredElements.clear();
      currentWord = null;
    
      hoverConfigs.forEach(config => {
        circleElement?.classList.remove(config.className);
      });
    
      circleElement.classList.remove('hovered-lock');
    
      lockedElement = null;
      lockedConfig = null;
      isTransitioning = true;
      transitionStartTime = performance.now();
      wasLocked = false;
      updateCursorColor(null);
      
      if (circleElement) {
        circleElement.style.width = '';
        circleElement.style.height = '';
      }
    
      hoverConfigs.forEach(config => {
        if (config.customEvent && hoveredElements.size > 0) {
          window.dispatchEvent(new CustomEvent(config.customEvent.unhovered, {
            bubbles: true
          }));
        }
      });
    }
  }

  let cleanupHoverDetection: (() => void) | null = null;

  onMount(() => {
    isTouchDevice = 'ontouchstart' in window;

    const unsubscribeHoverConfig = hoverConfigStore.subscribe(configs => {
      hoverConfigs = configs;
      
      if (cleanupHoverDetection) {
        cleanupHoverDetection();
      }
      
      cleanupHoverDetection = setupHoverDetection();
    });

    switch (isTouchDevice) {
      case true:
        touchVisibility = 0;
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchmove", handleTouchMove);
        window.addEventListener("touchend", handleTouchEnd);
        break;
      case false:
        window.addEventListener("mousemove", (e) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        });
        break;
    }

    const speed = 0.3;
    const hoverSpeed = 0.15;
    const transitionDuration = 300;

    const handleNavigationStart = () => {
      isNavigating = true;
      if (circleElement) {
        circleElement.style.opacity = "0";
      }
    };

    document.addEventListener('sveltekit:navigation-start', handleNavigationStart);
    document.addEventListener('click', handleDocumentClick);

    const tick = () => {
      if (isNavigating) {
        requestAnimationFrame(tick);
        return;
      }

      handleWordHover();

      if (isTransitioning) {
        const elapsed = performance.now() - transitionStartTime;
        if (elapsed > transitionDuration) {
          isTransitioning = false;
          wasLocked = false;
        }
      }

      let targetX = mouse.x;
      let targetY = mouse.y;
      let targetWidth: number | undefined;
      let targetHeight: number | undefined;

      if (lockedElement && lockedConfig && lockedConfig.lockPosition) {
         const targetCenter = getTargetCenter(lockedElement, lockedConfig);
         targetX = targetCenter.x;
         targetY = targetCenter.y;
         targetWidth = targetCenter.width;
         targetHeight = targetCenter.height;
      }

      const currentSpeed = (lockedElement && lockedConfig) ? hoverSpeed : speed;
      
      circle.x += (targetX - circle.x) * currentSpeed;
      circle.y += (targetY - circle.y) * currentSpeed;

      if (circleElement) {
        if (lockedElement && lockedConfig && lockedConfig.wrapText && targetWidth && targetHeight) {
          circleElement.style.width = `${targetWidth}px`;
          circleElement.style.height = `${targetHeight}px`;
        } else {
          circleElement.style.width = '';
          circleElement.style.height = '';
        }
      }

      const translateTransform = `translate(${circle.x}px, ${circle.y}px) translate(-50%, -50%)`;

      const deltaMouseX = mouse.x - previousMouse.x;
      const deltaMouseY = mouse.y - previousMouse.y;
      previousMouse.x = mouse.x;
      previousMouse.y = mouse.y;

      const mouseVelocity = Math.min(Math.sqrt(deltaMouseX**2 + deltaMouseY**2) * 5, 150);
      const scaleValue = (mouseVelocity / 150) * 0.5;
      currentScale += (scaleValue - currentScale) * speed;

      let finalScaleX = (1 + currentScale);
      let finalScaleY = (1 - currentScale);

      if (isTouchDevice) {
        finalScaleX *= touchVisibility;
        finalScaleY *= touchVisibility;
      }

      const allowRotation = shouldAllowRotation();
      const scaleTransform = (!allowRotation)
        ? ``
        : `scale(${finalScaleX}, ${finalScaleY})`;

      const angle = Math.atan2(deltaMouseY, deltaMouseX) * 180 / Math.PI;

      if (mouseVelocity > 10 && allowRotation) {
        currentAngle = angle;
      }

      const rotateTransform = (!allowRotation)
        ? ``
        : `rotate(${currentAngle}deg)`;

      if (circleElement) {
        if (lockedElement && lockedConfig && lockedConfig.wrapText) {
          circleElement.style.transform = translateTransform;
        } else {
          circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;
        }
      }

      if (isTouchDevice) {
        if (isTouchActive) {
          touchVisibility += (1 - touchVisibility) * 0.1;
        } else {
          touchVisibility += (0 - touchVisibility) * 0.1;
        }
      } else {
        touchVisibility = 1;
      }

      requestAnimationFrame(tick);
    };

    tick();

    afterNavigate(() => {
      isNavigating = false;
      if (circleElement) {
        circleElement.style.opacity = "1";
      }
      setTimeout(() => {
        if (circleElement) {
          softResetCursor();
          circle.x = mouse.x;
          circle.y = mouse.y;
          circleElement.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
        }
      }, 100);
    });

    return () => {
      document.removeEventListener('sveltekit:navigation-start', handleNavigationStart);
      document.removeEventListener('click', handleDocumentClick);
      if (cleanupHoverDetection) {
        cleanupHoverDetection();
      }
      unsubscribeHoverConfig();
    };
  });
</script>

<div bind:this={circleElement} class="circle"></div>