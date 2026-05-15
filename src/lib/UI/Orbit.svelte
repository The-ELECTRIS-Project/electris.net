<script lang="ts">
  import { onMount } from "svelte";
  import { afterNavigate } from '$app/navigation';
  import { hoverConfigState, type HoverConfig } from '$lib/stores/hoverConfig.svelte';

  let circleElement: HTMLElement | undefined = $state();

  const mouse = $state({ x: 0, y: 0 });
  const previousMouse = { x: 0, y: 0 };
  const circle = $state({ x: 0, y: 0 });
  
  let currentWidth = $state(0);
  let currentHeight = $state(0);
  let currentBorderRadius = $state(0);
  
  let currentScale = 0;
  let currentAngle = 0;

  let touchVisibility = $state(1);
  let isTouchCapable = $state(false);
  let lastInputWasTouch = $state(false);
  let isOrbitEnabled = $state(false);

  let hasDetectedCursor = $state(false);
  let isSpawning = $state(false);
  let spawnProgress = $state(0);
  let spawnStartTime = 0;

  function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  let lockedElement: HTMLElement | null = $state(null);
  let lockedConfig: HoverConfig | null = $state(null);
  let hasSettledPositionLock = $state(false);
  let isTransitioning = $state(false);
  let transitionStartTime = 0;

  let currentWord: { element: HTMLElement, bounds: DOMRect, text: string } | null = $state(null);
  let wordHoverPadding = 0.8;

  let hoverConfigs = $derived(hoverConfigState.configs);
  const hoveredElements = new Set<HTMLElement>();
  let lastColorElement: HTMLElement | null = null;

  // Measurement and style caching
  let cachedRects = new Map<HTMLElement, DOMRect>();
  let cachedStyles = new Map<HTMLElement, CSSStyleDeclaration>();
  let cachedWordBounds = new Map<HTMLElement, { element: HTMLElement, bounds: DOMRect, text: string }[]>();

  let lastCheckX = -1;
  let lastCheckY = -1;
  let lastScrollX = -1;
  let lastScrollY = -1;
  let animationFrameId: number;

  type TransformCapableStyle = CSSStyleDeclaration & {
    webkitTransform?: string;
    mozTransform?: string;
  };

  type TargetMetrics = {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    borderRadius?: number;
  };

  function getRotation(element: HTMLElement): number {
    const style = getCachedStyle(element) as TransformCapableStyle;
    const transform = style.transform || style.webkitTransform || style.mozTransform;
    
    if (transform && transform !== 'none') {
      const values = transform.split('(')[1].split(')')[0].split(',');
      const a = parseFloat(values[0]);
      const b = parseFloat(values[1]);
      return Math.round(Math.atan2(b, a) * (180/Math.PI));
    }
    
    return 0;
  }

  function getCachedStyle(element: HTMLElement): CSSStyleDeclaration {
    if (!cachedStyles.has(element)) {
      cachedStyles.set(element, window.getComputedStyle(element));
    }
    return cachedStyles.get(element)!;
  }

  function getCachedRect(element: HTMLElement): DOMRect {
    if (!cachedRects.has(element)) {
      cachedRects.set(element, element.getBoundingClientRect());
    }
    return cachedRects.get(element)!;
  }

  function parseCssLengthToPx(value: string, reference: number): number {
    const trimmedValue = value.trim();

    if (!trimmedValue) return 0;
    if (trimmedValue.endsWith('%')) {
      return (parseFloat(trimmedValue) / 100) * reference;
    }

    const parsedValue = parseFloat(trimmedValue);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  function parseCornerRadiusToPx(value: string, width: number, height: number): number {
    const [horizontalPart, verticalPart = horizontalPart] = value.split('/');
    const horizontalTokens = horizontalPart.trim().split(/\s+/).filter(Boolean);
    const verticalTokens = verticalPart.trim().split(/\s+/).filter(Boolean);

    const horizontalRadii = horizontalTokens.map(token => parseCssLengthToPx(token, width));
    const verticalRadii = verticalTokens.map(token => parseCssLengthToPx(token, height));

    return Math.max(0, ...horizontalRadii, ...verticalRadii);
  }

  function getElementBorderRadiusPx(element: HTMLElement, rect: DOMRect): number {
    const style = getCachedStyle(element);

    return Math.max(
      parseCornerRadiusToPx(style.borderTopLeftRadius, rect.width, rect.height),
      parseCornerRadiusToPx(style.borderTopRightRadius, rect.width, rect.height),
      parseCornerRadiusToPx(style.borderBottomRightRadius, rect.width, rect.height),
      parseCornerRadiusToPx(style.borderBottomLeftRadius, rect.width, rect.height)
    );
  }

  function resolveTargetSize(rect: DOMRect, config: HoverConfig): { width: number, height: number } {
    let width = rect.width;
    let height = rect.height;

    if (config.absoluteSizeOffset !== undefined) {
      if (typeof config.absoluteSizeOffset === 'number') {
        const sizePx = vminToPx(config.absoluteSizeOffset);
        width = sizePx;
        height = sizePx;
      } else {
        if (config.absoluteSizeOffset.width !== undefined) width = vminToPx(config.absoluteSizeOffset.width);
        if (config.absoluteSizeOffset.height !== undefined) height = vminToPx(config.absoluteSizeOffset.height);
      }
    }

    if (config.dynamicSizeOffset !== undefined) {
      if (typeof config.dynamicSizeOffset === 'number') {
        const offsetPx = vminToPx(config.dynamicSizeOffset);
        width += offsetPx;
        height += offsetPx;
      } else {
        if (config.dynamicSizeOffset.width !== undefined) width += vminToPx(config.dynamicSizeOffset.width);
        if (config.dynamicSizeOffset.height !== undefined) height += vminToPx(config.dynamicSizeOffset.height);
      }
    }

    return { width, height };
  }

  function resolveTargetBorderRadius(baseBorderRadius: number, config: HoverConfig): number {
    let borderRadius = baseBorderRadius;
    const absoluteBorderRadius = config.absoluteBorderRadiusOffset ?? config.borderRadius;

    if (absoluteBorderRadius !== undefined) {
      borderRadius = vminToPx(absoluteBorderRadius);
    }

    if (config.dynamicBorderRadiusOffset !== undefined) {
      borderRadius += vminToPx(config.dynamicBorderRadiusOffset);
    }

    return Math.max(borderRadius, 0);
  }

  function updateOrbitColor(element: HTMLElement | null, config?: HoverConfig) {
    if (!circleElement) return;

    if (element && config) {
      if (lastColorElement === element) return;
      lastColorElement = element;
      
      if (config.color) {
        circleElement.style.borderColor = config.color;
        circleElement.style.color = config.color;
      } else if (config.wrapText) {
        const color = getCachedStyle(element).color;
        circleElement.style.borderColor = color;
        circleElement.style.color = color;
      } else {
        circleElement.style.borderColor = '';
        circleElement.style.color = getCachedStyle(circleElement).borderTopColor;
      }
    } else {
      if (lastColorElement === null) return;
      lastColorElement = null;
      circleElement.style.borderColor = '';
      circleElement.style.color = '';
    }
  }
  
  function vminToPx(vmin: number): number {
    return (vmin / 100) * Math.min(window.innerHeight, window.innerWidth);
  }

  function hasNoInteractClass(element: HTMLElement): boolean {
    return element.closest('.circle-no-interact, .circle-no-interact-all') !== null;
  }

  function hasNoWrapClass(element: HTMLElement): boolean {
    return element.closest('.wrap-no-interact, .wrap-no-interact-all') !== null;
  }

  function getWordAtPosition(x: number, y: number, wrapConfig: HoverConfig['wrapText'], targetElement?: HTMLElement): { element: HTMLElement, bounds: DOMRect, text: string } | null {
    if (!wrapConfig) return null;
    
    const words = wrapConfig.words ?? false;
    const sentences = wrapConfig.sentences ?? false;
    
    if (words === false && sentences === false) {
      return null;
    }
    
    if (words && sentences) {
      console.error('wrapText cannot have both words and sentences set to true');
      return null;
    }
    
    const elements = document.elementsFromPoint(x, y);
    if (elements.length === 0) return null;

    // The first element in stacking order that blocks pointers (ignoring Orbit)
    let blockerIndex = -1;
    for (let i = 0; i < elements.length; i++) {
       const el = elements[i] as HTMLElement;
       if (el === circleElement) continue;
       if (getCachedStyle(el).pointerEvents !== 'none') {
         blockerIndex = i;
         break;
       }
    }
    
    if (blockerIndex === -1) return null;
    const topElement = elements[blockerIndex] as HTMLElement;

    for (let i = blockerIndex; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      const textElement = element as HTMLElement;
      
      if (hasNoWrapClass(textElement)) {
        continue;
      }

      // Visibility check: Only consider text elements that are not obscured
      if (textElement !== topElement && !textElement.contains(topElement)) {
        continue;
      }
      
      if (targetElement && !targetElement.contains(textElement) && targetElement !== textElement) {
        continue;
      }
      
      if (!isTextElement(textElement)) continue;
      
      if (sentences) {
        const rect = getCachedRect(textElement);
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
        if (!cachedWordBounds.has(textElement)) {
            const textNodes = getTextNodes(textElement);
            const wordList: { element: HTMLElement, bounds: DOMRect, text: string }[] = [];
            
            for (const textNode of textNodes) {
              const wordsInNode = getWordsFromTextNode(textNode, { 
                ignorePunctuation: wrapConfig.ignorePunctuation ?? false, 
                ignoreCharacters: wrapConfig.ignoreCharacters ?? false 
              });
              wordList.push(...wordsInNode);
            }
            cachedWordBounds.set(textElement, wordList);
        }

        const cachedWords = cachedWordBounds.get(textElement)!;
        for (const word of cachedWords) {
          if (x >= word.bounds.left && x <= word.bounds.right && y >= word.bounds.top && y <= word.bounds.bottom) {
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

    let node = walker.nextNode();
    while (node) {
      textNodes.push(node as Text);
      node = walker.nextNode();
    }
    return textNodes;
  }

  function getWordsFromTextNode(textNode: Text, filterConfig: { ignorePunctuation: boolean, ignoreCharacters: boolean }): { element: HTMLElement, bounds: DOMRect, text: string }[] {
    const text = textNode.textContent || '';
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const results: { element: HTMLElement, bounds: DOMRect, text: string }[] = [];
    
    if (words.length === 0) return results;

    const range = document.createRange();
    let currentIndex = 0;

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      const wordStart = text.indexOf(word, currentIndex);
      let wordEnd = wordStart + word.length;
      
      let actualStart = wordStart;
      let actualEnd = wordEnd;

      if (filterConfig.ignorePunctuation || filterConfig.ignoreCharacters) {
        if (filterConfig.ignorePunctuation && filterConfig.ignoreCharacters) {
          const match = word.match(/[\p{L}\p{N}]+/u);
          if (match) {
            const cleanWord = match[0];
            const cleanStart = word.indexOf(cleanWord);
            actualStart = wordStart + cleanStart;
            actualEnd = actualStart + cleanWord.length;
          } else {
            currentIndex = wordEnd;
            continue;
          }
        } else if (filterConfig.ignorePunctuation) {
          const match = word.match(/[\p{L}\p{N}\s\p{P}\p{S}]+/u);
          if (match) {
            const cleanWord = match[0];
            const cleanStart = word.indexOf(cleanWord);
            actualStart = wordStart + cleanStart;
            actualEnd = actualStart + cleanWord.length;
          }
        } else if (filterConfig.ignoreCharacters) {
          const match = word.match(/[\p{L}\p{N}.,;:!?"'()-]+/u);
          if (match) {
            const cleanWord = match[0];
            const cleanStart = word.indexOf(cleanWord);
            actualStart = wordStart + cleanStart;
            actualEnd = actualStart + cleanWord.length;
          }
        }
      }
      
      range.setStart(textNode, actualStart);
      range.setEnd(textNode, actualEnd);
      
      const rect = range.getBoundingClientRect();
      const parentElement = textNode.parentElement as HTMLElement;
      results.push({
        element: parentElement,
        bounds: rect,
        text: range.toString()
      });
      
      currentIndex = wordEnd;
    }

    return results;
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
    if (lockedElement && lockedConfig?.matchRotation) return true;
    if (isTransitioning) return false;
    if (lockedConfig?.preventRotation) return false;
    if (lockedElement) return false;
    return true;
  }

  function handleTouchStart(e: TouchEvent) {
    if (!hasDetectedCursor) hasDetectedCursor = true;
    lastInputWasTouch = true;
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
    softResetOrbit(true);
  }

  function handleTouchMove(e: TouchEvent) {
    if (!hasDetectedCursor) hasDetectedCursor = true;
    lastInputWasTouch = true;
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
  }

  function handleTouchEnd() {
  }

  function getTrackingElement(element: HTMLElement, config: HoverConfig): HTMLElement {
    if (config.trackingTarget) {
      const target = element.querySelector(config.trackingTarget) as HTMLElement;
      if (target) return target;
    }
    return element;
  }

  function getTargetCenter(element: HTMLElement, config: HoverConfig): TargetMetrics {
    if (config.wrapText && currentWord) {
      const bounds = getWordHoverBounds();
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        borderRadius: resolveTargetBorderRadius(vminToPx(wordHoverPadding), config)
      };
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

    if (config.positionOffset) {
      offsetX += config.positionOffset.x ? vminToPx(config.positionOffset.x) : 0;
      offsetY += config.positionOffset.y ? vminToPx(config.positionOffset.y) : 0;
    }

    let rect = target.getBoundingClientRect();
    cachedRects.set(target, rect);
    
    if (rect.width === 0 && rect.height === 0 && target !== element) {
        target = element;
        rect = target.getBoundingClientRect();
        cachedRects.set(target, rect);
    }

    let centerX = rect.left + rect.width / 2 + offsetX;
    let centerY = rect.top + rect.height / 2 + offsetY;

    let rotation = 0;
    if (config.matchRotation) {
        rotation = getRotation(target);
    }

    const { width, height } = resolveTargetSize(rect, config);
    const borderRadius = resolveTargetBorderRadius(getElementBorderRadiusPx(target, rect), config);

    return { x: centerX, y: centerY, width, height, rotation, borderRadius };
  }

  function dispatchCustomEvent(eventName: string, element: HTMLElement, config?: HoverConfig, index?: number) {
    if (!config) return;
    const center = getTargetCenter(element, config);
    const detail: { x: number, y: number, index?: number } = { x: center.x, y: center.y };
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
    if (elements.length === 0) return [];

    // The first element in stacking order that blocks pointers (ignoring Orbit)
    let blockerIndex = -1;
    for (let i = 0; i < elements.length; i++) {
       const el = elements[i] as HTMLElement;
       if (el === circleElement) continue;
       if (getCachedStyle(el).pointerEvents !== 'none') {
         blockerIndex = i;
         break;
       }
    }
    
    if (blockerIndex === -1) return [];
    const topElement = elements[blockerIndex] as HTMLElement;

    const configElementPairs: { config: HoverConfig, element: HTMLElement }[] = [];

    for (let i = blockerIndex; i < elements.length; i++) {
      const htmlElement = elements[i] as HTMLElement;
      
      if (hasNoInteractClass(htmlElement)) {
        continue;
      }

      // Visibility check: Only consider elements that are not obscured
      if (htmlElement !== topElement && !htmlElement.contains(topElement)) {
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
      const isDefault = config.selectors.length >= 7 && config.selectors.includes('a') && config.selectors.includes('p');
      if ((config.type && config.type.length > 0) || !isDefault) {
        elementsWithCustomOverrides.add(element);
      }
    });

    return configElementPairs.filter(({ config, element }) => {
      const isDefault = config.selectors.length >= 7 && config.selectors.includes('a') && config.selectors.includes('p');
      if ((config.type && config.type.length > 0) || !isDefault) {
        return true;
      }
      const hasDescendantWithOverride = Array.from(elementsWithCustomOverrides).some(overrideElement => {
        return element.contains(overrideElement) && element !== overrideElement;
      });

      return !hasDescendantWithOverride;
    });
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

    return configElementPairs.filter(({ config, element }) => {
      const isDefault = config.selectors.length >= 7 && config.selectors.includes('a') && config.selectors.includes('p');
      if ((config.type && config.type.length > 0) || !isDefault) {
        return true;
      }
      const hasDescendantWithOverride = Array.from(elementsWithCustomOverrides).some(overrideElement => {
        return element.contains(overrideElement) && element !== overrideElement;
      });

      return !hasDescendantWithOverride;
    });
  }

  function hasEnabledWrapText(config: HoverConfig): boolean {
    if (!config.wrapText) return false;
    const words = config.wrapText.words ?? false;
    const sentences = config.wrapText.sentences ?? false;
    return words || sentences;
  }

  function getWordAtPositionWithHierarchy(x: number, y: number): { element: HTMLElement, bounds: DOMRect, text: string, config: HoverConfig } | null {
    const applicableConfigs = getApplicableConfigsForPosition(x, y);
    
    const sortedConfigs = applicableConfigs.sort((a, b) => {
      const aIsCustom = (a.config.type && a.config.type.length > 0) ? 1 : 0;
      const bIsCustom = (b.config.type && b.config.type.length > 0) ? 1 : 0;
      
      if (aIsCustom !== bIsCustom) return bIsCustom - aIsCustom;

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
             hasSettledPositionLock = false;
             isTransitioning = true;
             transitionStartTime = performance.now();
             circleElement?.classList.remove('hovered-lock');
             
             updateOrbitColor(null);
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
        hasSettledPositionLock = false;
        
        isTransitioning = true;
        transitionStartTime = performance.now();
        
        circleElement?.classList.add('hovered-lock');

        updateOrbitColor(element, config);
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

    updateOrbitColor(element, config);

    if (config.lockPosition || config.matchRotation) {
      lockedElement = element;
      lockedConfig = config;
      hasSettledPositionLock = false;
      
      if (!circleElement?.classList.contains('hovered-lock')) {
        isTransitioning = true;
        transitionStartTime = performance.now();
      }
      
      circleElement?.classList.add('hovered-lock');
    }

    if (config.customEvent) {
      dispatchCustomEvent(config.customEvent.hovered, element, config);
    }
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
            hasSettledPositionLock = false;
                  isTransitioning = true;
            transitionStartTime = performance.now();
            circleElement?.classList.remove('hovered-lock');
            
            updateOrbitColor(null);
        }
    }

    if (config.customEvent) {
      window.dispatchEvent(new CustomEvent(config.customEvent.unhovered, {
        bubbles: true
      }));
    }
  }

  function setupHoverDetection() {
    const mouseOverHandler = (event: MouseEvent) => {
      hoverConfigs.forEach((config) => {
        handleHover(event, config);
      });
    };

    const mouseOutHandler = (event: MouseEvent) => {
      hoverConfigs.forEach(config => {
        handleUnhover(event, config);
      });
    };

    document.addEventListener('mouseover', mouseOverHandler);
    document.addEventListener('mouseout', mouseOutHandler);

    return () => {
      document.removeEventListener('mouseover', mouseOverHandler);
      document.removeEventListener('mouseout', mouseOutHandler);
    };
  }

  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
  
    const isClickingHoverableElement = hoverConfigs.some(config => {
      const matchResult = elementMatchesConfig(target, config);
      return matchResult.matches;
    });
  
    if (!isClickingHoverableElement) {
      softResetOrbit();
    }
  }

  function softResetOrbit(force = false) {
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
      hasSettledPositionLock = false;
      isTransitioning = true;
      transitionStartTime = performance.now();
      updateOrbitColor(null);
      
      if (circleElement) {
        circleElement.style.zIndex = '3000';
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

  $effect(() => {
    if (cleanupHoverDetection) cleanupHoverDetection();
    if (!isOrbitEnabled) {
      cleanupHoverDetection = null;
      return;
    }
    cleanupHoverDetection = setupHoverDetection();
  });

  onMount(() => {
    isTouchCapable = navigator.maxTouchPoints > 0 ||
      'ontouchstart' in window ||
      window.matchMedia('(any-pointer: coarse)').matches;

    const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches;
    isOrbitEnabled = hasFinePointer;

    if (!isOrbitEnabled) {
      if (circleElement) {
        circleElement.style.display = 'none';
        circleElement.style.opacity = '0';
      }
      return;
    }

    touchVisibility = isTouchCapable ? 0 : 1;

    if (circleElement) {
      circleElement.style.display = '';
      circleElement.style.opacity = '0';
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasDetectedCursor) hasDetectedCursor = true;
      lastInputWasTouch = false;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseDown = () => {
      if (!hasDetectedCursor) hasDetectedCursor = true;
      lastInputWasTouch = false;
    };
    const handleMouseUp = () => {
    };
    const handleResize = () => {
      cachedRects.clear();
      cachedStyles.clear();
      cachedWordBounds.clear();
      lastCheckX = -1;
      lastCheckY = -1;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);
    window.addEventListener("resize", handleResize);

    const speed = 0.35;
    const hoverSpeed = 0.25;
    const snapSpeed = 0.45; // Faster for snapping to elements
    const transitionDuration = 200;

    const handleNavigationStart = () => {
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    document.addEventListener('sveltekit:navigation-start', handleNavigationStart);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial state for JS interpolation
    currentWidth = vminToPx(2);
    currentHeight = vminToPx(2);
    currentBorderRadius = vminToPx(50);
    
    lastScrollX = window.scrollX;
    lastScrollY = window.scrollY;

    const tick = () => {
      if (hasDetectedCursor) {
        if (isSpawning) {
          const elapsed = performance.now() - spawnStartTime;
          const rawProgress = Math.min(elapsed / 100, 1);
          spawnProgress = easeInOutQuad(rawProgress);
          if (rawProgress === 1) {
            isSpawning = false;
          }
        } else if (spawnProgress < 1) {
          const dist = Math.hypot(mouse.x - circle.x, mouse.y - circle.y);
          if (dist < 1) {
            isSpawning = true;
            spawnStartTime = performance.now();
          }
        }
      } else {
        spawnProgress = 0;
      }

      const currentScrollX = window.scrollX;
      const currentScrollY = window.scrollY;
      const scrollDeltaX = currentScrollX - lastScrollX;
      const scrollDeltaY = currentScrollY - lastScrollY;
      
      // Scroll Compensation: Move the orbit with the page content
      circle.x -= scrollDeltaX;
      circle.y -= scrollDeltaY;
      
      // Update measurement cache on scroll or mouse move
      const didMouseMove = mouse.x !== lastCheckX || mouse.y !== lastCheckY;
      const didScrollChange = scrollDeltaX !== 0 || scrollDeltaY !== 0;
      if (didScrollChange) {
        cachedRects.clear();
        cachedStyles.clear();
        cachedWordBounds.clear();
      }

      // Dynamic tracking: If we're locked to an element, we MUST refresh its bounds 
      // every frame in case it's moving independently of scroll (e.g. parallax).
      if (lockedElement) {
        cachedRects.set(lockedElement, lockedElement.getBoundingClientRect());
        // Also refresh style in case z-index changed
        cachedStyles.delete(lockedElement);
      }

      if (didMouseMove || didScrollChange) {
        handleWordHover();
        lastCheckX = mouse.x;
        lastCheckY = mouse.y;
        lastScrollX = currentScrollX;
        lastScrollY = currentScrollY;
      }

      if (isTransitioning) {
        const elapsed = performance.now() - transitionStartTime;
        if (elapsed > transitionDuration) {
          isTransitioning = false;
        }
      }

      let targetX = mouse.x;
      let targetY = mouse.y;
      let targetWidth = vminToPx(2);
      let targetHeight = vminToPx(2);
      let targetBR = vminToPx(50);
      let targetRotation: number | undefined;

      if (lockedElement && lockedConfig) {
        const targetCenter = getTargetCenter(lockedElement, lockedConfig);
        
        if (lockedConfig.autoSize !== false && targetCenter.width !== undefined && targetCenter.height !== undefined) {
          targetWidth = targetCenter.width;
          targetHeight = targetCenter.height;

          if (targetCenter.borderRadius !== undefined) {
            targetBR = targetCenter.borderRadius;
          }
        }

        if (lockedConfig.lockPosition) {
          targetX = targetCenter.x;
          targetY = targetCenter.y;
        }
        if (lockedConfig.matchRotation) {
          targetRotation = targetCenter.rotation;
        }
      }

      const isPositionLocked = Boolean(lockedElement && lockedConfig?.lockPosition);
      const regularSpeed = (lockedElement && lockedConfig) ? hoverSpeed : speed;
      const currentSpeed = hasDetectedCursor ? (spawnProgress * regularSpeed + (1 - spawnProgress) * 1) : 1;
      
      // Interpolate layout properties in JS
      currentWidth += (targetWidth - currentWidth) * currentSpeed;
      currentHeight += (targetHeight - currentHeight) * currentSpeed;
      
      const brSpeed = currentSpeed * 3.5;
      currentBorderRadius += (targetBR - currentBorderRadius) * Math.min(brSpeed, 1);

      if (isPositionLocked && !hasSettledPositionLock) {
        const remainingDistance = Math.hypot(targetX - circle.x, targetY - circle.y);
        if (remainingDistance <= 1) {
          hasSettledPositionLock = true;
          circle.x = targetX;
          circle.y = targetY;
        } else {
          circle.x += (targetX - circle.x) * currentSpeed;
          circle.y += (targetY - circle.y) * currentSpeed;
        }
      } else if (isPositionLocked) {
        circle.x = targetX;
        circle.y = targetY;
      } else {
        circle.x += (targetX - circle.x) * currentSpeed;
        circle.y += (targetY - circle.y) * currentSpeed;
      }


      if (circleElement) {
        circleElement.style.width = `${currentWidth}px`;
        circleElement.style.height = `${currentHeight}px`;
        circleElement.style.borderRadius = `${currentBorderRadius}px`;

        // Update Z-Index to match context
        if (lockedElement) {
          let current: HTMLElement | null = lockedElement;
          let highestZ = 1;
          while (current && current !== document.documentElement) {
            const z = getCachedStyle(current).zIndex;
            if (z !== 'auto') {
              const val = parseInt(z);
              if (!isNaN(val)) highestZ = Math.max(highestZ, val);
            }
            current = current.parentElement;
          }
          circleElement.style.zIndex = (highestZ + 1).toString();
        } else {
          circleElement.style.zIndex = '3000';
        }
      }

      const translateTransform = `translate(${circle.x}px, ${circle.y}px) translate(-50%, -50%)`;

      const deltaMouseX = mouse.x - previousMouse.x;
      const deltaMouseY = mouse.y - previousMouse.y;
      previousMouse.x = mouse.x;
      previousMouse.y = mouse.y;

      const mouseVelocity = Math.min(Math.sqrt(deltaMouseX**2 + deltaMouseY**2) * 5, 150);
      
      const isLockedToPos = lockedElement && lockedConfig;
      const baseStretching = isLockedToPos ? 0 : (mouseVelocity / 150) * 0.5;
      const targetScaleValue = baseStretching * spawnProgress;
      
      currentScale += (targetScaleValue - currentScale) * currentSpeed;

      let finalScaleX = (1 + currentScale) * spawnProgress;
      let finalScaleY = (1 - currentScale) * spawnProgress;

      finalScaleX *= touchVisibility;
      finalScaleY *= touchVisibility;

      const allowRotation = shouldAllowRotation();
      const scaleTransform = (!allowRotation)
        ? ``
        : `scale(${finalScaleX}, ${finalScaleY})`;

      const angle = Math.atan2(deltaMouseY, deltaMouseX) * 180 / Math.PI;

      if (lockedElement && lockedConfig?.matchRotation && targetRotation !== undefined) {
        let diff = (targetRotation - currentAngle) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        // Synchronized Rotation Fix: Snap rotation faster when expanding to prevent spinning
        const rotationSyncSpeed = isTransitioning ? 0.9 : snapSpeed;
        currentAngle += diff * rotationSyncSpeed;
      } else if (mouseVelocity > 10 && allowRotation) {
        currentAngle = angle;
      }

      const rotateTransform = (!allowRotation)
        ? ``
        : `rotate(${currentAngle}deg)`;

      if (circleElement) {
        if (lockedElement && lockedConfig) {
          if (lockedConfig.matchRotation) {
            circleElement.style.transform = `${translateTransform} ${rotateTransform}`;
          } else {
            circleElement.style.transform = translateTransform;
          }
        } else {
          circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;
        }

        circleElement.style.opacity = `${touchVisibility * spawnProgress}`;
      }

      const targetVisibility = !isTouchCapable || !lastInputWasTouch ? 1 : 0;
      touchVisibility += (targetVisibility - touchVisibility) * 0.16;

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    afterNavigate(() => {
      setTimeout(() => {
        if (circleElement) {
          softResetOrbit();
          circle.x = mouse.x;
          circle.y = mouse.y;
          circleElement.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
          // Trigger a re-check after navigation settles
          lastCheckX = -1;
        }
      }, 100);
    });

    return () => {
      document.removeEventListener('sveltekit:navigation-start', handleNavigationStart);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (cleanupHoverDetection) {
        cleanupHoverDetection();
      }
    };
  });
</script>

<div bind:this={circleElement} class="circle"></div>
