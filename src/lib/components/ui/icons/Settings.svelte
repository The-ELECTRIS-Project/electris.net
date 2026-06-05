<script lang="ts">
  export type IconName = 
    | 'appearance' 
    | 'interface'
    | 'theme'
    | 'color'
    | 'language' 
    | 'scrollbar'
    | 'orbit'
    | 'devtools' 
    | 'sitedata' 
    | 'ytapi' 
    | 'theme-default' 
    | 'theme-cyber' 
    | 'color-auto' 
    | 'color-light' 
    | 'color-dark' 
    | 'color-midnight'
    | 'reset-cookie'
    | 'reset-storage'
    | 'reset-everything'
    | 'chevron-right'
    | 'chevron-left'
    | 'text-spacing';

  let { name, size = '1.2rem', class: className = '' } = $props<{
    name: IconName;
    size?: string;
    class?: string;
  }>();

  const icons: Record<IconName, { path: string; viewBox: string }> = {
    appearance: {
      path: '<path d="M12 15V3m0 18v-3M5 11V3m0 18v-7m14-4V3m0 18v-11M2 11h6M9 15h6m2-8h6" />',
      viewBox: '0 0 24 24'
    },
    interface: {
      path: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />',
      viewBox: '0 0 24 24'
    },
    theme: {
      path: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.5-.58 1.5-1.5 0-.44-.18-.85-.44-1.19-.29-.31-.44-.73-.44-1.19 0-.92.58-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z" />',
      viewBox: '0 0 24 24'
    },
    color: {
      path: '<circle cx="12" cy="12" r="10" /><path d="M12 2a7 7 0 0 0-7 7v5a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7z" /><circle cx="12" cy="12" r="3" />',
      viewBox: '0 0 24 24'
    },
    language: {
      path: '<circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />',
      viewBox: '0 0 24 24'
    },
    scrollbar: {
      path: '<rect x="10" y="3" width="4" height="18" rx="2" /><rect x="11" y="7" width="2" height="6" rx="1" fill="currentColor" />',
      viewBox: '0 0 24 24'
    },
    orbit: {
      path: '<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" />',
      viewBox: '0 0 24 24'
    },
    devtools: {
      path: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />',
      viewBox: '0 0 24 24'
    },
    sitedata: {
      path: '<ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />',
      viewBox: '0 0 24 24'
    },
    ytapi: {
      path: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />',
      viewBox: '0 0 24 24'
    },
    'theme-default': {
      path: '<path d="m6 3-1.6 7.41C4.15 11.66 5.17 13 6.58 13h2.81L7.79 21l8.61-11.41C17.15 8.34 16.13 7 14.72 7h-2.81L13.51 3H6z" />',
      viewBox: '0 0 24 24'
    },
    'theme-cyber': {
      path: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />',
      viewBox: '0 0 24 24'
    },
    'color-auto': {
      path: '<path d="M20.49 9A9 9 0 0 0 5.64 5.64L3 8.29V3m-1.49 12a9 9 0 0 0 14.85 3.36L19 15.71V21" />',
      viewBox: '0 0 24 24'
    },
    'color-light': {
      path: '<circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />',
      viewBox: '0 0 24 24'
    },
    'color-dark': {
      path: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />',
      viewBox: '0 0 24 24'
    },
    'color-midnight': {
      path: '<path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm0 14a5 5 0 1 1 5-5 5 5 0 0 1-5 5z" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />',
      viewBox: '0 0 24 24'
    },
    'reset-cookie': {
      path: '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><circle cx="8" cy="8.5" r=".5" fill="currentColor" /><circle cx="15" cy="11.5" r=".5" fill="currentColor" /><circle cx="9" cy="14.5" r=".5" fill="currentColor" /><circle cx="12" cy="17.5" r=".5" fill="currentColor" /><circle cx="5" cy="13.5" r=".5" fill="currentColor" />',
      viewBox: '0 0 24 24'
    },
    'reset-storage': {
      path: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />',
      viewBox: '0 0 24 24'
    },
    'reset-everything': {
      path: '<circle cx="12" cy="13" r="9" /><path d="M12 4V2M4.93 4.93l1.41 1.41M20 12h2M19.07 19.07l-1.41-1.41M12 22v-2M4.93 19.07l1.41-1.41M2 12h2M6.34 17.66l-1.41 1.41M2 2l20 20" />',
      viewBox: '0 0 24 24'
    },
    'chevron-right': {
      path: '<polyline points="9 18 15 12 9 6" />',
      viewBox: '0 0 24 24'
    },
    'chevron-left': {
      path: '<polyline points="15 18 9 12 15 6" />',
      viewBox: '0 0 24 24'
    },
    'text-spacing': {
      path: '<rect x="3" y="3" width="18" height="18" rx="3" ry="3" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="12" y1="7" x2="12" y2="17" />',
      viewBox: '0 0 24 24'
    }
  };

  const icon = $derived(icons[name as IconName]);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox={icon.viewBox}
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="settings-svg {className}"
>
  {@html icon.path}
</svg>

<style>
  .settings-svg {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }
</style>
