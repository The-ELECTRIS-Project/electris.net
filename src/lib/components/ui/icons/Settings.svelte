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
    | 'twaos'
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

  const viewBoxes: Record<IconName, string> = {
    appearance: '0 0 24 24',
    interface: '0 0 24 24',
    theme: '0 0 24 24',
    color: '0 0 24 24',
    language: '0 0 24 24',
    scrollbar: '0 0 24 24',
    orbit: '0 0 24 24',
    devtools: '0 0 24 24',
    sitedata: '0 0 24 24',
    ytapi: '0 0 24 24',
    'theme-default': '0 0 24 24',
    'theme-cyber': '0 0 24 24',
    'twaos': '0 0 2048 2048',
    'color-auto': '0 0 24 24',
    'color-light': '0 0 24 24',
    'color-dark': '0 0 24 24',
    'color-midnight': '0 0 24 24',
    'reset-cookie': '0 0 24 24',
    'reset-storage': '0 0 24 24',
    'reset-everything': '0 0 24 24',
    'chevron-right': '0 0 24 24',
    'chevron-left': '0 0 24 24',
    'text-spacing': '0 0 24 24'
  };

  let viewBox = $derived(viewBoxes[name as IconName] || '0 0 24 24');
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  {viewBox}
  fill="none"
  stroke="currentColor"
  stroke-width={name === 'theme-wonderful' ? '140' : '2'}
  stroke-linecap="round"
  stroke-linejoin="round"
  class="settings-svg {className}"
>
  {#if name === 'appearance'}
    <path d="M12 15V3m0 18v-3M5 11V3m0 18v-7m14-4V3m0 18v-11M2 11h6M9 15h6m2-8h6" />
  {:else if name === 'interface'}
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  {:else if name === 'theme'}
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.5-.58 1.5-1.5 0-.44-.18-.85-.44-1.19-.29-.31-.44-.73-.44-1.19 0-.92.58-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z" />
  {:else if name === 'color'}
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a7 7 0 0 0-7 7v5a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7z" />
    <circle cx="12" cy="12" r="3" />
  {:else if name === 'language'}
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  {:else if name === 'scrollbar'}
    <rect x="10" y="3" width="4" height="18" rx="2" />
    <rect x="11" y="7" width="2" height="6" rx="1" fill="currentColor" />
  {:else if name === 'orbit'}
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  {:else if name === 'devtools'}
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  {:else if name === 'sitedata'}
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  {:else if name === 'ytapi'}
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  {:else if name === 'theme-default'}
    <path d="m6 3-1.6 7.41C4.15 11.66 5.17 13 6.58 13h2.81L7.79 21l8.61-11.41C17.15 8.34 16.13 7 14.72 7h-2.81L13.51 3H6z" />
  {:else if name === 'theme-cyber'}
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  {:else if name === 'theme-wonderful'}
    <g transform="matrix(0.9, 0, 0, 0.9, 102.4, 102.4)">
      <circle cx="1024" cy="1024" r="1000" />
      <path d="M 1384.0 490.0 L 1354.0 496.0 L 1334.0 505.0 L 1318.0 516.0 L 1300.0 534.0 L 1280.0 571.0 L 1275.0 595.0 L 1275.0 618.0 L 1283.0 650.0 L 1294.0 671.0 L 1311.0 691.0 L 1331.0 706.0 L 1352.0 716.0 L 1370.0 721.0 L 1398.0 723.0 L 1438.0 714.0 L 1454.0 706.0 L 1476.0 689.0 L 1492.0 669.0 L 1503.0 647.0 L 1509.0 624.0 L 1510.0 597.0 L 1501.0 561.0 L 1488.0 538.0 L 1474.0 522.0 L 1459.0 510.0 L 1436.0 498.0 L 1409.0 491.0 Z"/>
      <path d="M 605.0 493.0 L 585.0 497.0 L 559.0 508.0 L 528.0 534.0 L 516.0 551.0 L 506.0 573.0 L 501.0 597.0 L 501.0 621.0 L 506.0 645.0 L 517.0 669.0 L 544.0 700.0 L 560.0 711.0 L 584.0 721.0 L 626.0 726.0 L 650.0 722.0 L 669.0 715.0 L 688.0 704.0 L 707.0 687.0 L 721.0 668.0 L 730.0 649.0 L 736.0 623.0 L 736.0 595.0 L 730.0 570.0 L 720.0 549.0 L 704.0 528.0 L 690.0 516.0 L 668.0 503.0 L 649.0 496.0 Z"/>
      <path d="M 1544.0 1255.0 L 1530.0 1225.0 L 1510.0 1210.0 L 1482.0 1208.0 L 1458.0 1222.0 L 1446.0 1243.0 L 1430.0 1337.0 L 1403.0 1422.0 L 1361.0 1489.0 L 1329.0 1516.0 L 1263.0 1554.0 L 1197.0 1579.0 L 1125.0 1596.0 L 1053.0 1604.0 L 961.0 1602.0 L 852.0 1585.0 L 760.0 1557.0 L 699.0 1529.0 L 641.0 1490.0 L 606.0 1445.0 L 580.0 1384.0 L 557.0 1279.0 L 539.0 1250.0 L 518.0 1240.0 L 488.0 1242.0 L 465.0 1260.0 L 456.0 1288.0 L 479.0 1395.0 L 506.0 1465.0 L 542.0 1520.0 L 618.0 1592.0 L 700.0 1639.0 L 806.0 1677.0 L 924.0 1700.0 L 1031.0 1705.0 L 1148.0 1692.0 L 1248.0 1665.0 L 1327.0 1629.0 L 1397.0 1580.0 L 1456.0 1518.0 L 1494.0 1455.0 L 1523.0 1371.0 Z"/>
    </g>
  {:else if name === 'color-auto'}
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L3 8.29V3m-1.49 12a9 9 0 0 0 14.85 3.36L19 15.71V21" />
  {:else if name === 'color-light'}
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  {:else if name === 'color-dark'}
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  {:else if name === 'color-midnight'}
    <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm0 14a5 5 0 1 1 5-5 5 5 0 0 1-5 5z" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  {:else if name === 'reset-cookie'}
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
    <circle cx="8" cy="8.5" r=".5" fill="currentColor" />
    <circle cx="15" cy="11.5" r=".5" fill="currentColor" />
    <circle cx="9" cy="14.5" r=".5" fill="currentColor" />
    <circle cx="12" cy="17.5" r=".5" fill="currentColor" />
    <circle cx="5" cy="13.5" r=".5" fill="currentColor" />
  {:else if name === 'reset-storage'}
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  {:else if name === 'reset-everything'}
    <circle cx="12" cy="13" r="9" />
    <path d="M12 4V2M4.93 4.93l1.41 1.41M20 12h2M19.07 19.07l-1.41-1.41M12 22v-2M4.93 19.07l1.41-1.41M2 12h2M6.34 17.66l-1.41 1.41M2 2l20 20" />
  {:else if name === 'chevron-right'}
    <polyline points="9 18 15 12 9 6" />
  {:else if name === 'chevron-left'}
    <polyline points="15 18 9 12 15 6" />
  {:else if name === 'text-spacing'}
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="12" y1="7" x2="12" y2="17" />
  {/if}
</svg>

<style>
  .settings-svg {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }
</style>
