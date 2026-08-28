<script lang="ts">
  import Badge from './Badge.svelte';
  import Card from './Card.svelte';

  let {
    title,
    handle = undefined,
    description = undefined,
    icon = undefined,
    href = undefined,
    status = undefined,
    statusLabel = undefined,
    size = 'default',
    titleFont = undefined,
    class: className = ''
  } = $props<{
    title: string;
    handle?: string;
    description?: string;
    icon?: string;
    href?: string;
    status?: 'coming-soon' | 'deprecated';
    statusLabel?: string;
    size?: 'compact' | 'default';
    titleFont?: string;
    class?: string;
  }>();

  let unreachable = $derived(!href || href === '#');
</script>

<Card
  href={unreachable ? undefined : href}
  external={!unreachable}
  {size}
  disabled={unreachable}
  muted={status === 'deprecated'}
  class="link-card {className}"
>
  {#if icon}
    <span class="icon-frame" class:compact={size === 'compact'}>
      <img src={icon} alt="" />
    </span>
  {/if}

  <span class="body">
    <span class="head">
      <h2 style={titleFont ? `font-family: ${titleFont};` : undefined}>{title}</h2>
      {#if handle}<Badge tone="accent">{handle}</Badge>{/if}
    </span>

    {#if description}<p>{description}</p>{/if}

    {#if status}
      <Badge tone={status === 'deprecated' ? 'danger' : 'info'} size="sm">
        {statusLabel ?? status.replace('-', ' ')}
      </Badge>
    {/if}
  </span>
</Card>

<style>
  .icon-frame {
    flex-shrink: 0;
    margin-right: var(--space-5);
  }

  .icon-frame img {
    width: 4rem;
    height: 4rem;
    padding: var(--space-2);
    background: #fff;
    border-radius: var(--radius-md);
    object-fit: contain;
    box-shadow: var(--shadow-sm);
  }

  .icon-frame.compact img {
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
  }

  .body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  h2 {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--text-xl);
    line-height: 1;
  }

  p {
    margin: 0;
    font-family: var(--font-body);
  }
</style>
