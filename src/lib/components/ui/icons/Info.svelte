<script lang="ts">
  let { size = '1rem', class: className = '' } = $props<{
    size?: string;
    class?: string;
  }>();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon-info {className}"
>
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="12" y1="16" x2="12" y2="12"></line>
  <line x1="12" y1="8" x2="12.01" y2="8"></line>
</svg>

<style>
  .icon-info {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }
</style>
