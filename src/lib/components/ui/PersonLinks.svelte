<script lang="ts">
  import Card from './Card.svelte';
  import LinkCard from './LinkCard.svelte';

  type PlatformLink = {
    title: string;
    handle?: string;
    description?: string;
    platformLogo: string;
    url: string;
  };

  let {
    name,
    role,
    logo,
    links = [],
    emptyMessage = undefined
  } = $props<{
    name: string;
    role: string;
    logo: string;
    links?: PlatformLink[];
    emptyMessage?: string;
  }>();
</script>

<div class="person">
  <div class="member-header">
    <img src={logo} alt={name} class="member-logo" />
    <div>
      <h3>{name}</h3>
      <p class="member-role">{role}</p>
    </div>
  </div>

  <div class="stack">
    {#each links as link}
      <LinkCard
        title={link.title}
        handle={link.handle}
        description={link.description}
        icon={link.platformLogo}
        href={link.url}
        size="compact"
      />
    {/each}

    {#if links.length === 0 && emptyMessage}
      <Card size="compact" disabled>
        <p class="empty-note">{emptyMessage}</p>
      </Card>
    {/if}
  </div>
</div>

<style>
  .member-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .member-logo {
    width: 3.5rem;
    height: 3.5rem;
    object-fit: contain;
  }

  h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-lg);
  }

  .member-role {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .stack {
    display: grid;
    gap: var(--space-4);
  }

  .empty-note {
    margin: 0;
    font-family: var(--font-body);
  }
</style>
