<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/state/i18n.svelte';
    import PageShell from '$lib/components/ui/PageShell.svelte';
    import EmptyState from '$lib/components/ui/EmptyState.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let { artist, singles } = $derived(data);

    onMount(() => {
        gsap.from('.single-card', {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out'
        });

        setTimeout(() => {
            const c = document.querySelector('.circle');
            if (c) c.className = 'circle';
        }, 10);
    });
</script>

<svelte:head>
    <title>Singles | {artist.name} | ELECTRIS</title>
</svelte:head>

<PageShell width="full" class="singles-page">
    <header class="page-header">
        <a href="/music/{artist.slug}" class="back-link">
            ← {artist.name}
        </a>
        <h1>{t('ems.music.card.disc', 'Singles')}</h1>
    </header>

    {#if singles.length > 0}
        <div class="singles-grid">
            {#each singles as single}
                <a 
                    href="/music/{artist.slug}/single/{single.slug}" 
                    class="single-card"
                >
                    <div class="cover-wrapper">
                        <img src={single.cover} alt={single.title} class="cover-img" />
                        <div class="cover-overlay">
                            <span>VIEW DETAILS</span>
                        </div>
                    </div>
                    <div class="info">
                        <h3 style="font-family: {single.titleFont || 'inherit'}">{single.title}</h3>
                        <p style="font-family: {single.artistFont || 'inherit'}">{single.artist}</p>
                    </div>
                </a>
            {/each}
        </div>
    {:else}
        <EmptyState
            class="none-found"
            icon="/icons/buttons/cd.svg"
            title={t('ems.music.singles.empty.title', 'No singles yet')}
            description="{artist.name} {t(
                'ems.music.singles.empty.body',
                'hasn\'t put a single out yet. When that changes, it will show up here.'
            )}"
        >
            <Button href="/music/{artist.slug}" variant="fill" class="btn-return">
                {t('ems.music.return.artist', 'Back to the artist')}
            </Button>
        </EmptyState>
    {/if}
</PageShell>

<style>
    .page-header {
        margin-bottom: var(--space-8);
    }

    .back-link {
        text-decoration: none;
        color: var(--accent);
        font-weight: bold;
        opacity: 0.7;
        transition: opacity var(--duration-normal) var(--ease-out);
    }

    .back-link:hover {
        opacity: 1;
    }

    .page-header h1 {
        font-family: var(--font-display);
        font-size: var(--display-md);
        margin: var(--space-4) 0 0;
        color: var(--accent);
    }

    .singles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
        gap: var(--space-7);
    }

    .single-card {
        background: var(--surface-raised);
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        transition: transform var(--duration-normal) var(--ease-out);
    }

    .cover-wrapper {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-md);
        overflow: hidden;
        margin-bottom: var(--space-5);
        box-shadow: var(--shadow-md);
    }

    .cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--duration-slow) var(--ease-out);
    }

    .cover-overlay {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--accent) 35%, transparent);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity var(--duration-normal) var(--ease-out);
    }

    .cover-overlay span {
        color: var(--text-on-accent);
        font-weight: bold;
        letter-spacing: 0.15em;
        font-size: var(--text-sm);
    }

    .single-card:hover .cover-img {
        transform: scale(1.1);
    }

    .single-card:hover .cover-overlay {
        opacity: 1;
    }

    .info h3 {
        margin: 0;
        font-size: var(--text-xl);
        color: var(--accent);
    }

    .info p {
        margin: var(--space-1) 0 0;
        opacity: 0.6;
        font-size: var(--text-sm);
    }

    :global(.singles-page .none-found) {
        padding-top: var(--space-8);
    }

    :global(.singles-page .none-found .empty-icon) {
        width: 8rem;
        height: 8rem;
        background: color-mix(in srgb, var(--accent) 10%, transparent);
        margin-bottom: var(--space-6);
        opacity: 0.5;
    }

    :global(.singles-page .none-found .empty-icon img) {
        width: var(--space-8);
        opacity: 0.5;
    }

    :global(.singles-page .none-found h2) {
        font-size: var(--display-sm);
        margin-bottom: var(--space-4);
        opacity: 0.8;
    }

    :global(.singles-page .none-found p) {
        max-width: 27rem;
        opacity: 0.6;
        margin-bottom: var(--space-6);
    }

    :global(.singles-page .none-found .btn-return) {
        padding: var(--space-3) var(--space-6);
        color: var(--accent);
        border-radius: var(--radius-pill);
    }
</style>
