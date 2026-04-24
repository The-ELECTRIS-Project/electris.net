<script lang="ts">
  interface Props {
    type?: 'card' | 'live' | 'row';
    big?: boolean;
    count?: number;
  }

  let { type = 'card', big = false, count = 2 }: Props = $props();
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
  <div class="skeleton-card" class:big-card={big}>
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
    {#each Array(count) as _}
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
      radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--color-primary) 4%, transparent), transparent 36%),
      linear-gradient(160deg, color-mix(in srgb, var(--bg-body) 90%, transparent), color-mix(in srgb, var(--bg-body) 82%, transparent));
    border: 1px solid color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-radius: 2rem;
    position: relative;
    overflow: hidden;
  }

  .skeleton-live {
    display: grid;
    grid-template-columns: minmax(14rem, 20rem) minmax(0, 1fr);
    gap: 2rem;
    padding: 1.45rem;
    width: min(100%, 72rem);
    margin: 0 auto 2.8rem;
  }

  .skeleton-card {
    display: grid;
    gap: 1.35rem;
    padding: 1.45rem;
  }

  .skeleton-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .skeleton-media {
    aspect-ratio: 16 / 9;
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    border-radius: 1.45rem;
    position: relative;
    overflow: hidden;
  }

  .skeleton-info, .skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .skeleton-badges {
    display: flex;
    gap: 0.6rem;
  }

  .skeleton-badge {
    width: 5rem;
    height: 1.6rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  }

  .skeleton-line {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-radius: 4px;
  }

  .skeleton-line.title {
    width: 70%;
    height: 2rem;
  }

  .skeleton-line.summary {
    width: 100%;
    height: 4rem;
  }

  .skeleton-line.meta {
    width: 40%;
    height: 1rem;
  }

  .skeleton-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .skeleton-detail {
    height: 4rem;
    border-radius: 1.1rem;
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }

  /* Shimmer animation */
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
      color-mix(in srgb, var(--color-primary) 5%, transparent),
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