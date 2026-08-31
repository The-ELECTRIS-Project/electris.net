<script lang="ts">
  import { fade } from 'svelte/transition';
  import { t, i18nState } from '$lib/state/i18n.svelte';

  let { content } = $props<{ content?: string }>();

  let isVisible = $state(false);
  let x = $state(0);
  let y = $state(0);
  let placement = $state<'top' | 'bottom'>('top');
  let activeLink = $state<HTMLElement | null>(null);
  interface GithubData {
    type: 'repository' | 'pull_request' | 'issue' | 'user';
    fallback?: boolean;
    data: {
      owner?: string;
      repo?: string;
      name?: string;
      fullName?: string;
      description?: string;
      stars?: number;
      forks?: number;
      language?: string;
      avatarUrl?: string;
      updatedAt?: string;
      title?: string;
      number?: number;
      state?: string;
      author?: string;
      authorAvatar?: string;
      additions?: number;
      deletions?: number;
      commits?: number;
      createdAt?: string;
      login?: string;
      bio?: string;
      followers?: number;
      following?: number;
      publicRepos?: number;
      location?: string;
      company?: string;
    };
  }

  let loading = $state(false);
  let previewData = $state<GithubData | null>(null);
  let targetUrl = $state('');

  let popoverElement = $state<HTMLElement | undefined>();

  let hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let leaveTimer: ReturnType<typeof setTimeout> | null = null;

  const previewCache = new Map<string, GithubData>();

  // Every measurement here is in rem, so the popover tracks the text it sits beside.
  const POPOVER_WIDTH = 22;
  const POPOVER_FALLBACK_HEIGHT = 13;
  const POPOVER_MARGIN = 0.875;
  const POPOVER_OFFSET = 0.6;
  const POPOVER_CLEARANCE = 1.5;

  const RESERVED_PATHS = new Set([
    'features', 'pricing', 'trending', 'pulls', 'issues', 'marketplace',
    'explore', 'notifications', 'settings', 'orgs', 'search', 'login',
    'join', 'contact', 'about', 'site', 'security', 'resources',
    'collections', 'topics', 'readme', 'sponsors', 'watching', 'stars'
  ]);

  const LANGUAGE_COLORS: Record<string, string> = {
    javascript: '#f1e05a',
    typescript: '#3178c6',
    python: '#3572A5',
    go: '#00ADD8',
    rust: '#dea584',
    html: '#e34c26',
    css: '#563d7c',
    svelte: '#ff3e00',
    c: '#555555',
    'c++': '#f34b7d',
    ruby: '#701516',
    java: '#b07219'
  };

  function getLanguageColor(lang?: string): string {
    if (!lang) return '#858585';
    return LANGUAGE_COLORS[lang.toLowerCase()] || '#858585';
  }

  function getFallbackData(urlStr: string): GithubData | null {
    try {
      const url = new URL(urlStr);
      const path = url.pathname.replace(/^\/|\/$/g, '');
      const segments = path.split('/');
      
      if (segments.length >= 4 && segments[2] === 'pull') {
        return {
          type: 'pull_request',
          fallback: true,
          data: {
            owner: segments[0],
            repo: segments[1],
            number: parseInt(segments[3], 10),
            title: `Pull Request #${segments[3]}`,
            state: 'open'
          }
        };
      } else if (segments.length >= 4 && segments[2] === 'issues') {
        return {
          type: 'issue',
          fallback: true,
          data: {
            owner: segments[0],
            repo: segments[1],
            number: parseInt(segments[3], 10),
            title: `Issue #${segments[3]}`,
            state: 'open'
          }
        };
      } else if (segments.length >= 2) {
        return {
          type: 'repository',
          fallback: true,
          data: {
            owner: segments[0],
            name: segments[1],
            fullName: `${segments[0]}/${segments[1]}`
          }
        };
      } else if (segments.length === 1 && segments[0]) {
        return {
          type: 'user',
          fallback: true,
          data: {
            login: segments[0],
            name: segments[0]
          }
        };
      }
    } catch {
      // ignore
    }
    return null;
  }

  function calculatePosition(link: HTMLElement) {
    if (!link) return;

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const popoverWidth = POPOVER_WIDTH * rem;

    const linkRect = link.getBoundingClientRect();
    const popoverHeight = popoverElement
      ? popoverElement.getBoundingClientRect().height
      : POPOVER_FALLBACK_HEIGHT * rem;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let leftPos = linkRect.left + (linkRect.width / 2) - (popoverWidth / 2);

    const margin = POPOVER_MARGIN * rem;
    if (leftPos < margin) {
      leftPos = margin;
    } else if (leftPos + popoverWidth > viewportWidth - margin) {
      leftPos = viewportWidth - popoverWidth - margin;
    }

    const spaceBelow = viewportHeight - linkRect.bottom;
    const offset = POPOVER_OFFSET * rem;
    const clearance = POPOVER_CLEARANCE * rem;

    // Prefer bottom, but switch to top if there is not enough space below
    if (spaceBelow > popoverHeight + offset + clearance) {
      y = linkRect.bottom + offset;
      placement = 'bottom';
    } else if (linkRect.top > popoverHeight + offset + clearance) {
      y = linkRect.top - popoverHeight - offset;
      placement = 'top';
    } else {
      // Default to bottom if it doesn't fit anywhere well
      y = linkRect.bottom + offset;
      placement = 'bottom';
    }

    x = leftPos;
  }

  function onLinkEnter(link: HTMLElement) {
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      leaveTimer = null;
    }

    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }

    hoverTimer = setTimeout(async () => {
      activeLink = link;
      const url = link.getAttribute('href') || '';
      targetUrl = url;

      calculatePosition(link);
      isVisible = true;

      const cachedData = previewCache.get(url);
      if (cachedData) {
        previewData = cachedData;
        loading = false;
        setTimeout(() => {
          if (activeLink === link) calculatePosition(link);
        }, 0);
        return;
      }

      loading = true;
      previewData = null;

      try {
        const response = await fetch(`/api/github?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Failed to load preview');
        }
        const data = (await response.json()) as GithubData;
        previewCache.set(url, data);
        
        if (activeLink === link) {
          previewData = data;
          loading = false;
          setTimeout(() => {
            if (activeLink === link) calculatePosition(link);
          }, 0);
        }
      } catch {
        if (activeLink === link) {
          loading = false;
          previewData = getFallbackData(url);
          setTimeout(() => {
            if (activeLink === link) calculatePosition(link);
          }, 0);
        }
      }
    }, 200);
  }

  function onLinkLeave() {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }

    leaveTimer = setTimeout(() => {
      closePopover();
    }, 300);
  }

  function onPopoverEnter() {
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      leaveTimer = null;
    }
  }

  function onPopoverLeave() {
    leaveTimer = setTimeout(() => {
      closePopover();
    }, 300);
  }

  function closePopover() {
    isVisible = false;
    activeLink = null;
    loading = false;
  }

  let activeListeners: Array<{ element: HTMLElement; enter: () => void; leave: () => void }> = [];

  function setupListeners() {
    cleanupListeners();

    const links = document.querySelectorAll('.post-content a[href*="github.com"]');
    links.forEach((link) => {
      if (!(link instanceof HTMLElement)) return;

      const urlStr = link.getAttribute('href') || '';
      try {
        const parsed = new URL(urlStr);
        const path = parsed.pathname.replace(/^\/|\/$/g, '');
        const segments = path.split('/');
        
        if (segments.length === 0 || !segments[0]) return;
        const firstSegment = segments[0].toLowerCase();
        if (RESERVED_PATHS.has(firstSegment)) return;

        link.classList.add('github-hover-link');

        const handleMouseEnter = () => onLinkEnter(link);
        const handleMouseLeave = () => onLinkLeave();

        link.addEventListener('mouseenter', handleMouseEnter);
        link.addEventListener('mouseleave', handleMouseLeave);

        activeListeners.push({
          element: link,
          enter: handleMouseEnter,
          leave: handleMouseLeave
        });
      } catch {
        // invalid URL
      }
    });
  }

  function cleanupListeners() {
    activeListeners.forEach(({ element, enter, leave }) => {
      if (element) {
        element.removeEventListener('mouseenter', enter);
        element.removeEventListener('mouseleave', leave);
        element.classList.remove('github-hover-link');
      }
    });
    activeListeners = [];
  }

  $effect(() => {
    if (content) {
      const timer = setTimeout(() => {
        setupListeners();
      }, 50);

      return () => {
        clearTimeout(timer);
        cleanupListeners();
      };
    }
  });

  $effect(() => {
    if (isVisible && activeLink) {
      const handleResizeOrScroll = () => {
        if (activeLink) calculatePosition(activeLink);
      };
      window.addEventListener('resize', handleResizeOrScroll);
      window.addEventListener('scroll', handleResizeOrScroll, { passive: true });
      return () => {
        window.removeEventListener('resize', handleResizeOrScroll);
        window.removeEventListener('scroll', handleResizeOrScroll);
      };
    }
  });

  function formatDate(dateString?: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18nState.currentLocale || undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  }
</script>

{#if isVisible}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={popoverElement}
    transition:fade={{ duration: 150 }}
    class="github-preview-popover {placement}"
    style="left: {x}px; top: {y}px;"
    onmouseenter={onPopoverEnter}
    onmouseleave={onPopoverLeave}
  >
    {#if loading}
      <div class="loader-container">
        <div class="spinner"></div>
      </div>
    {:else if previewData}
      {@const d = previewData.data}
      <div class="popover-content">
        {#if previewData.type === 'repository'}
          <div class="popover-header">
            {#if d.avatarUrl}
              <img class="avatar" src={d.avatarUrl} alt="" />
            {/if}
            <div class="title-area">
              <a href={targetUrl} target="_blank" rel="noopener noreferrer" class="repo-name">
                {d.fullName}
              </a>
            </div>
          </div>
          {#if d.description}
            <p class="description">{d.description}</p>
          {/if}
          <div class="footer-stats">
            {#if d.language}
              <span class="stat-item">
                <span class="lang-color" style="background-color: {getLanguageColor(d.language)}"></span>
                {d.language}
              </span>
            {/if}
            {#if d.stars !== undefined}
              <span class="stat-item">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
                </svg>
                {d.stars.toLocaleString()}
              </span>
            {/if}
            {#if d.forks !== undefined}
              <span class="stat-item">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5A2.25 2.25 0 0 0 12.5 6.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75v-.878ZM12.5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-4 9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
                </svg>
                {d.forks.toLocaleString()}
              </span>
            {/if}
          </div>
          {#if previewData.fallback}
            <div class="fallback-badge">{t('github.fallback', 'Offline view')}</div>
          {/if}

        {:else if previewData.type === 'pull_request'}
          <div class="repo-context">{d.owner}/{d.repo}</div>
          <div class="popover-header">
            <div class="title-area">
              <a href={targetUrl} target="_blank" rel="noopener noreferrer" class="item-title">
                {d.title} <span class="item-number">#{d.number}</span>
              </a>
            </div>
          </div>
          <div class="meta-row">
            <span class="badge {d.state}">
              {#if d.state === 'merged'}
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5A2.25 2.25 0 0 0 12.5 6.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75v-.878ZM12.5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-4 9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
                </svg>
                {t('github.state.merged', 'Merged')}
              {:else if d.state === 'closed'}
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path d="M1.5 3.25a2.25 2.25 0 1 1 3 1.872v5.756a2.25 2.25 0 1 1-3 0V5.122A2.25 2.25 0 0 1 1.5 3.25Zm1.5 0a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm0 9.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm9.5-9.5a2.25 2.25 0 1 1 3 1.872v5.756a2.25 2.25 0 1 1-3 0V5.122A2.25 2.25 0 0 1 12.5 3.25Zm1.5 0a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm0 9.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0ZM5.75 7.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5H5.75Z"/>
                </svg>
                {t('github.state.closed', 'Closed')}
              {:else}
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path d="M1.5 3.25a2.25 2.25 0 1 1 3 1.872v5.756a2.25 2.25 0 1 1-3 0V5.122A2.25 2.25 0 0 1 1.5 3.25Zm1.5 0a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm0 9.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm9.5-9.5a2.25 2.25 0 1 1 3 1.872v5.756a2.25 2.25 0 1 1-3 0V5.122A2.25 2.25 0 0 1 1.5 3.25Zm1.5 0a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm0 9.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0ZM5.75 7.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5H5.75Z"/>
                </svg>
                {t('github.state.open', 'Open')}
              {/if}
            </span>
            {#if d.author}
              <span class="author-info">
                {#if d.authorAvatar}
                  <img class="mini-avatar" src={d.authorAvatar} alt="" />
                {/if}
                {t('github.author.by', 'by')} <strong>{d.author}</strong>
              </span>
            {/if}
          </div>
          {#if d.additions !== undefined || d.deletions !== undefined}
            <div class="diff-stats">
              <span class="additions">+{d.additions}</span>
              <span class="deletions">-{d.deletions}</span>
              <span class="commits-count">
                {d.commits}
                {d.commits === 1
                  ? t('github.commits.one', 'commit')
                  : t('github.commits.many', 'commits')}
              </span>
            </div>
          {/if}
          {#if previewData.fallback}
            <div class="fallback-badge">{t('github.fallback', 'Offline view')}</div>
          {/if}

        {:else if previewData.type === 'issue'}
          <div class="repo-context">{d.owner}/{d.repo}</div>
          <div class="popover-header">
            <div class="title-area">
              <a href={targetUrl} target="_blank" rel="noopener noreferrer" class="item-title">
                {d.title} <span class="item-number">#{d.number}</span>
              </a>
            </div>
          </div>
          <div class="meta-row">
            <span class="badge {d.state}">
              {#if d.state === 'closed'}
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path d="M11.28 3.97a.75.75 0 1 1 1.06 1.06l-6.22 6.22a.75.75 0 0 1-1.06 0L2.16 8.34a.75.75 0 1 1 1.06-1.06l2.44 2.44 5.62-5.75Z"/><path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Z"/>
                </svg>
                {t('github.state.closed', 'Closed')}
              {:else}
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>
                </svg>
                {t('github.state.open', 'Open')}
              {/if}
            </span>
            {#if d.author}
              <span class="author-info">
                {#if d.authorAvatar}
                  <img class="mini-avatar" src={d.authorAvatar} alt="" />
                {/if}
                {t('github.author.by', 'by')} <strong>{d.author}</strong>
              </span>
            {/if}
          </div>
          {#if d.createdAt}
            <div class="time-info">{t('github.issue.opened', 'Opened on')} {formatDate(d.createdAt)}</div>
          {/if}
          {#if previewData.fallback}
            <div class="fallback-badge">{t('github.fallback', 'Offline view')}</div>
          {/if}

        {:else if previewData.type === 'user'}
          <div class="popover-header">
            {#if d.avatarUrl}
              <img class="user-avatar" src={d.avatarUrl} alt="" />
            {/if}
            <div class="user-info-area">
              <a href={targetUrl} target="_blank" rel="noopener noreferrer" class="user-display-name">
                {d.name}
              </a>
              <div class="user-login">@{d.login}</div>
            </div>
          </div>
          {#if d.bio}
            <p class="description user-bio">{d.bio}</p>
          {/if}
          <div class="user-stats">
            {#if d.followers !== undefined}
              <span class="user-stat">
                <strong>{d.followers}</strong> {t('github.user.followers', 'followers')}
              </span>
            {/if}
            {#if d.following !== undefined}
              <span class="user-stat">
                <strong>{d.following}</strong> {t('github.user.following', 'following')}
              </span>
            {/if}
            {#if d.publicRepos !== undefined}
              <span class="user-stat">
                <strong>{d.publicRepos}</strong> {t('github.user.repos', 'repos')}
              </span>
            {/if}
          </div>
          {#if previewData.fallback}
            <div class="fallback-badge">{t('github.fallback', 'Offline view')}</div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .github-preview-popover {
    /* GitHub's own state palette, so a merged or closed item reads the same as it does there. */
    --github-open: #238636;
    --github-open-text: #3fb950;
    --github-closed: #da3633;
    --github-closed-text: #f85149;
    --github-merged: #8957e5;
    --github-merged-text: #a371f7;
    --github-additions: #2ea043;
    position: fixed;
    width: 22rem;
    z-index: var(--z-popup);
    pointer-events: auto;
    border-radius: var(--radius-lg);
    background: var(--surface-overlay);
    border: 1px solid var(--accent);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    box-shadow:
      var(--shadow-lg),
      0 0 var(--space-4) color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
    font-family: var(--font-body);
    overflow: hidden;
    transition: transform var(--duration-normal) var(--ease-out);
  }

  .github-preview-popover.top {
    transform-origin: bottom center;
    animation: scale-up-top var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .github-preview-popover.bottom {
    transform-origin: top center;
    animation: scale-up-bottom var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes scale-up-top {
    from {
      opacity: 0;
      transform: translateY(var(--space-2)) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes scale-up-bottom {
    from {
      opacity: 0;
      transform: translateY(calc(var(--space-2) * -1)) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 7.5rem;
    width: 100%;
  }

  .spinner {
    width: 1.75rem;
    height: 1.75rem;
    border: 2px solid color-mix(in srgb, var(--accent) 10%, transparent);
    border-top: 2px solid var(--accent);
    border-radius: var(--radius-round);
    animation: spin 0.8s linear infinite;
  }

  .popover-content {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    font-size: var(--text-sm);
    line-height: 1.4;
  }

  .popover-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .avatar {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-xs);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .user-avatar {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: var(--radius-round);
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .title-area {
    flex-grow: 1;
    min-width: 0;
  }

  .repo-name {
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-weight: bold;
    color: var(--accent-hover);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  .repo-name:hover {
    text-decoration: underline;
  }

  .description {
    font-family: var(--font-ui);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    opacity: 0.85;
  }

  .user-bio {
    font-style: italic;
  }

  .footer-stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    font-size: var(--text-xs);
    align-items: center;
    margin-top: var(--space-1);
    color: var(--text-muted);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .lang-color {
    width: var(--space-2);
    height: var(--space-2);
    border-radius: var(--radius-round);
    display: inline-block;
  }

  /* ===== PULL REQUESTS AND ISSUES ===== */

  .repo-context {
    font-size: var(--text-2xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .item-title {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--accent-hover);
    text-decoration: none;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-title:hover {
    text-decoration: underline;
  }

  .item-number {
    color: var(--text-muted);
    font-weight: normal;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-xs);
    margin-top: var(--space-1);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-pill);
    font-size: var(--text-2xs);
    font-weight: 600;
    text-transform: capitalize;
  }

  .badge.open {
    background: color-mix(in srgb, var(--github-open) 15%, transparent);
    border: 1px solid var(--github-open);
    color: var(--github-open-text);
  }

  .badge.closed {
    background: color-mix(in srgb, var(--github-closed) 15%, transparent);
    border: 1px solid var(--github-closed);
    color: var(--github-closed-text);
  }

  .badge.merged {
    background: color-mix(in srgb, var(--github-merged) 15%, transparent);
    border: 1px solid var(--github-merged);
    color: var(--github-merged-text);
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-secondary);
  }

  .mini-avatar {
    width: var(--space-4);
    height: var(--space-4);
    border-radius: var(--radius-round);
  }

  .diff-stats {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-xs);
    margin-top: var(--space-1);
  }

  .additions {
    color: var(--github-additions);
    font-weight: 600;
  }

  .deletions {
    color: var(--github-closed-text);
    font-weight: 600;
  }

  .commits-count {
    color: var(--text-muted);
    margin-left: var(--space-1);
  }

  .time-info {
    font-size: var(--text-2xs);
    color: var(--text-muted);
    margin-top: var(--space-1);
  }

  /* ===== USERS AND ORGANISATIONS ===== */

  .user-info-area {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .user-display-name {
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-weight: bold;
    color: var(--accent-hover);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-display-name:hover {
    text-decoration: underline;
  }

  .user-login {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .user-stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    font-size: var(--text-xs);
    color: var(--text-muted);
    border-top: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
    padding-top: var(--space-2);
    margin-top: var(--space-1);
  }

  .user-stat strong {
    color: var(--accent);
  }

  .fallback-badge {
    font-size: var(--text-2xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    align-self: flex-end;
    margin-top: calc(var(--space-1) * -1);
    opacity: 0.6;
  }

  :global(.github-hover-link) {
    position: relative;
    cursor: pointer;
  }
</style>
