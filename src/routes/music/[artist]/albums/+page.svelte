<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/state/i18n.svelte';
    import PageShell from '$lib/components/ui/PageShell.svelte';
    import EmptyState from '$lib/components/ui/EmptyState.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let { artist, albums } = $derived(data);

    onMount(() => {
        gsap.from('.album-card', {
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
    <title>Albums | {artist.name} | ELECTRIS</title>
</svelte:head>

<PageShell width="full" class="albums-page">
    <header class="page-header">
        <a href="/music/{artist.slug}" class="back-link">
            ← {artist.name}
        </a>
        <h1>{t('ems.music.card.vinyl', 'Albums')}</h1>
    </header>

    {#if albums.length > 0}
        <div class="albums-grid">
            {#each albums as album}
                <a 
                    href="/music/{artist.slug}/album/{album.slug}" 
                    class="album-card"
                >
                    <div class="cover-wrapper">
                        <img src={album.cover} alt={album.title} class="cover-img" />
                        <div class="cover-overlay">
                            <span>VIEW TRACKS</span>
                        </div>
                    </div>
                    <div class="info">
                        <h3 style="font-family: {album.titleFont || 'inherit'}">{album.title}</h3>
                        <p style="font-family: {album.artistFont || 'inherit'}">{album.artist}</p>
                    </div>
                </a>
            {/each}
        </div>
    {:else}
        <EmptyState
            class="none-found"
            icon="/icons/buttons/vinyl.svg"
            title={t('ems.music.albums.empty.title', 'No albums yet')}
            description="{artist.name} {t(
                'ems.music.albums.empty.body',
                'hasn\'t put an album out yet. When that changes, it will show up here.'
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

    .albums-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
        gap: var(--space-8);
    }

    .album-card {
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
        border-radius: var(--radius-xs);
        overflow: hidden;
        margin-bottom: var(--space-5);
        box-shadow: var(--shadow-lg);
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
        background: color-mix(in srgb, var(--accent) 90%, transparent);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity var(--duration-normal) var(--ease-out);
    }

    .cover-overlay span {
        color: var(--text-on-accent);
        font-weight: bold;
        letter-spacing: 0.2em;
        font-size: var(--text-base);
    }

    .album-card:hover .cover-img {
        transform: scale(1.05);
    }

    .album-card:hover .cover-overlay {
        opacity: 1;
    }

    .info h3 {
        margin: 0;
        font-size: var(--text-xl);
        color: var(--accent);
    }

    .info p {
        margin: var(--space-1) 0 0;
        opacity: 0.7;
        font-size: var(--text-base);
    }

    :global(.albums-page .none-found) {
        padding-top: var(--space-8);
    }

    :global(.albums-page .none-found .empty-icon) {
        width: 9.5rem;
        height: 9.5rem;
        background: color-mix(in srgb, var(--accent) 5%, transparent);
        border: 1px dashed color-mix(in srgb, var(--accent) 30%, transparent);
        margin-bottom: var(--space-7);
    }

    :global(.albums-page .none-found .empty-icon img) {
        width: 4.75rem;
        opacity: 0.3;
        animation: spin 20s linear infinite;
    }

    :global(.albums-page .none-found h2) {
        font-size: var(--display-sm);
        margin-bottom: var(--space-4);
        opacity: 0.8;
        color: var(--accent);
    }

    :global(.albums-page .none-found p) {
        max-width: 30rem;
        opacity: 0.6;
        margin-bottom: var(--space-7);
        line-height: 1.6;
    }

    :global(.albums-page .none-found .btn-return) {
        --btn-shadow-hover: 0 0.35rem 1rem color-mix(in srgb, var(--accent) 30%, transparent);
        padding: var(--space-4) var(--space-7);
        color: var(--accent);
        border-radius: var(--radius-xs);
        font-weight: bold;
        letter-spacing: 0.07em;
    }

    @media (max-width: 900px) {
        :global(.albums-page) {
            --shell-pad-top: calc(var(--layout-page-top) + var(--space-4));
            --shell-pad-inline: var(--space-4);
        }

        .page-header {
            margin-bottom: var(--space-7);
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            min-height: var(--touch-target-size);
            font-size: var(--text-base);
        }

        .albums-grid {
            grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
            gap: var(--space-5);
        }

        :global(.albums-page .none-found) {
            padding-top: var(--space-7);
        }

        :global(.albums-page .none-found .empty-icon) {
            width: 6.5rem;
            height: 6.5rem;
            margin-bottom: var(--space-5);
        }

        :global(.albums-page .none-found .empty-icon img) {
            width: var(--space-7);
        }

        :global(.albums-page .none-found .btn-return) {
            padding: var(--space-3) var(--space-5);
            min-height: var(--touch-target-size);
        }
    }

    @media (max-width: 560px) {
        .albums-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (any-pointer: coarse) {
        .cover-overlay {
            opacity: 1;
            background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--accent) 82%, transparent) 100%);
            align-items: flex-end;
            padding: var(--space-4);
        }

        .cover-overlay span {
            font-size: var(--text-sm);
            letter-spacing: 0.16em;
        }
    }
</style>
