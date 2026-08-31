<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/state/i18n.svelte';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let { artist, albums } = $derived(data);

    let container: HTMLElement;

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

<div class="albums-page" bind:this={container}>
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
                    class="album-card card"
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
        <div class="none-found">
            <div class="empty-icon">
                <img src="/icons/buttons/vinyl.svg" alt="Empty" />
            </div>
            <h2>NO ALBUMS YET</h2>
            <p>{artist.name} hasn't released any albums on ELECTRIS yet. When they do, they'll appear here!</p>
            <a href="/music/{artist.slug}" class="btn-return">Return to Artist</a>
        </div>
    {/if}
</div>

<style>
    .albums-page {
        min-height: 100vh;
        padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
    }

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

    .none-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding-top: var(--space-8);
    }

    .empty-icon {
        width: 9.5rem;
        height: 9.5rem;
        background: color-mix(in srgb, var(--accent) 5%, transparent);
        border: 1px dashed color-mix(in srgb, var(--accent) 30%, transparent);
        border-radius: var(--radius-round);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: var(--space-7);
    }

    .empty-icon img {
        width: 4.75rem;
        opacity: 0.3;
        animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .none-found h2 {
        font-family: var(--font-display);
        font-size: var(--display-sm);
        margin-bottom: var(--space-4);
        opacity: 0.8;
        color: var(--accent);
    }

    .none-found p {
        max-width: 30rem;
        opacity: 0.6;
        margin-bottom: var(--space-7);
        line-height: 1.6;
    }

    .btn-return {
        padding: var(--space-4) var(--space-7);
        background: transparent;
        border: 1px solid var(--accent);
        color: var(--accent);
        text-decoration: none;
        border-radius: var(--radius-xs);
        font-weight: bold;
        letter-spacing: 0.07em;
        transition:
            var(--transition-colors),
            box-shadow var(--duration-slow) var(--ease-out);
    }

    .btn-return:hover {
        background: var(--accent);
        color: var(--text-on-accent);
        box-shadow: 0 0.35rem 1rem color-mix(in srgb, var(--accent) 30%, transparent);
    }

    @media (max-width: 900px) {
        .albums-page {
            padding: calc(var(--layout-page-top) + var(--space-4)) var(--space-4) var(--space-8);
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

        .none-found {
            padding-top: var(--space-7);
        }

        .empty-icon {
            width: 6.5rem;
            height: 6.5rem;
            margin-bottom: var(--space-5);
        }

        .empty-icon img {
            width: var(--space-7);
        }

        .btn-return {
            padding: var(--space-3) var(--space-5);
            min-height: var(--touch-target-size);
            display: inline-flex;
            align-items: center;
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
