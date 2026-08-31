<script lang="ts">
  interface Props {
    type?: 'card' | 'live' | 'row';
    count?: number;
  }

  let { type = 'card', count = 2 }: Props = $props();

  let skeletonIndices = $derived(Array.from({ length: count }, (_, i) => i));
</script>

{#if type === 'live'}
  <div class="skeleton-live">
    <div class="skeleton-media"></div>
    <div class="skeleton-info">
      <div class="skeleton-badges">
        <div class="skeleton-badge"></div>
        <div class="skeleton-badge"></div>
      </div>
      <div class="skeleton-line title"></div>
      <div class="skeleton-line summary"></div>
      <div class="skeleton-line meta"></div>
    </div>
  </div>
{:else if type === 'card'}
  <div class="skeleton-card">
    <div class="skeleton-media"></div>
    <div class="skeleton-content">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line summary"></div>
      <div class="skeleton-details">
        <div class="skeleton-detail"></div>
        <div class="skeleton-detail"></div>
      </div>
    </div>
  </div>
{:else if type === 'row'}
  <div class="skeleton-row">
    {#each skeletonIndices as i (i)}
      <div class="skeleton-card">
        <div class="skeleton-media"></div>
        <div class="skeleton-content">
          <div class="skeleton-line title"></div>
          <div class="skeleton-line summary"></div>
          <div class="skeleton-details">
            <div class="skeleton-detail"></div>
            <div class="skeleton-detail"></div>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .skeleton-live, .skeleton-card {
    background:
      radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--accent) 4%, transparent), transparent 36%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-page) 90%, transparent), color-mix(in srgb, var(--surface-page) 82%, transparent));
    border: 1px solid color-mix(in srgb, var(--accent) 10%, transparent);
    border-radius: var(--radius-2xl);
    position: relative;
    overflow: hidden;
  }

  .skeleton-live {
    display: grid;
    grid-template-columns: minmax(14rem, 20rem) minmax(0, 1fr);
    gap: var(--space-5);
    padding: var(--space-5);
    width: min(100%, 72rem);
    margin: 0 auto var(--space-6);
  }

  .skeleton-card {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .skeleton-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
    margin-bottom: var(--space-5);
  }

  .skeleton-media {
    aspect-ratio: 16 / 9;
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    border-radius: var(--radius-xl);
    position: relative;
    overflow: hidden;
  }

  .skeleton-info, .skeleton-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .skeleton-badges {
    display: flex;
    gap: var(--space-2);
  }

  .skeleton-badge {
    width: 5rem;
    height: 1.6rem;
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .skeleton-line {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-radius: var(--radius-xs);
  }

  .skeleton-line.title {
    width: 70%;
    height: var(--space-6);
  }

  .skeleton-line.summary {
    width: 100%;
    height: var(--space-8);
  }

  .skeleton-line.meta {
    width: 40%;
    height: var(--space-4);
  }

  .skeleton-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .skeleton-detail {
    height: var(--space-8);
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  /* ===== SHIMMER ===== */

  .skeleton-media::after,
  .skeleton-badge::after,
  .skeleton-line::after,
  .skeleton-detail::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--accent) 5%, transparent),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @media (max-width: 1024px) {
    .skeleton-live {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .skeleton-row {
      grid-template-columns: 1fr;
    }
  }
</style>