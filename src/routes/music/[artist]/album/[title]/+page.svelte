<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let { artist, album } = $derived(data);

    onMount(() => {
        gsap.from('.album-cover', { x: -50, opacity: 0, duration: 1, ease: 'power3.out' });
        gsap.from('.album-info > *', { x: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' });
        gsap.from('.tracklist-item', { y: 20, opacity: 0, duration: 0.5, stagger: 0.05, delay: 0.5 });
        
        setTimeout(() => {
            const c = document.querySelector('.circle');
            if (c) c.className = 'circle';
        }, 10);
    });
</script>

<svelte:head>
    <title>{album.title} | {artist.name} | ELECTRIS</title>
</svelte:head>

<div class="album-detail">
    <div class="content-wrapper">
        <div class="album-sidebar">
            <div class="album-cover">
                <img src={album.cover} alt={album.title} />
            </div>
            
            <div class="album-meta">
                <nav class="breadcrumb">
                    <a href="/music/{artist.slug}">{artist.name}</a>
                    <span>/</span>
                    <a href="/music/{artist.slug}/albums">Albums</a>
                </nav>

                <h1 style="font-family: {album.titleFont || 'inherit'}">{album.title}</h1>
                <p class="release-date">Released {new Date(album.releaseDate).toLocaleDateString()}</p>
                
                {#if album.description}
                    <p class="description">{album.description}</p>
                {/if}

                <div class="listen-links">
                    <div class="links-grid">
                        {#if album.links?.youtube}
                            <a href={album.links.youtube} target="_blank" class="link-btn option">YouTube</a>
                        {/if}
                        {#if album.links?.spotify}
                            <a href={album.links.spotify} target="_blank" class="link-btn option">Spotify</a>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <div class="tracklist-container">
            <h2>TRACKLIST</h2>
            <div class="tracklist">
                {#each album.tracks as track, i}
                    <div class="tracklist-item option" role="listitem">
                        <span class="track-num">{String(i + 1).padStart(2, '0')}</span>
                        <span class="track-title">{track.title}</span>
                        {#if track.duration}
                            <span class="track-duration">{track.duration}</span>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .album-detail {
        min-height: 100vh;
        padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
    }

    .content-wrapper {
        display: grid;
        grid-template-columns: 27rem 1fr;
        gap: 10rem;
        max-width: 95rem;
        margin: 0 auto;
    }

    .album-cover {
        width: 100%;
        aspect-ratio: 1;
        border-radius: var(--radius-sm);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        margin-bottom: var(--space-7);
    }

    .album-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .breadcrumb {
        display: flex;
        gap: var(--space-2);
        margin-bottom: var(--space-5);
        font-size: var(--text-sm);
        opacity: 0.6;
    }

    .breadcrumb a {
        text-decoration: none;
        color: inherit;
    }

    .breadcrumb a:hover {
        color: var(--accent);
    }

    .album-meta h1 {
        font-size: var(--display-md);
        margin: 0;
        color: var(--accent);
        line-height: 1.1;
    }

    .release-date {
        opacity: 0.5;
        margin: var(--space-2) 0 var(--space-6);
    }

    .description {
        line-height: 1.6;
        opacity: 0.8;
        margin-bottom: var(--space-6);
    }

    .links-grid {
        display: flex;
        gap: var(--space-4);
    }

    .link-btn {
        padding: var(--space-2) var(--space-5);
        border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
        border-radius: var(--radius-sm);
        text-decoration: none;
        color: var(--accent);
        font-weight: bold;
        font-size: var(--text-sm);
        transition: var(--transition-colors);
    }

    .link-btn:hover {
        background: var(--accent);
        color: var(--text-on-accent);
    }

    .tracklist-container h2 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        letter-spacing: 0.14em;
        margin-bottom: var(--space-6);
        padding-bottom: var(--space-4);
        border-bottom: 1px solid color-mix(in srgb, var(--text-secondary) 12%, transparent);
        color: var(--accent);
    }

    .tracklist {
        display: flex;
        flex-direction: column;
    }

    .tracklist-item {
        display: flex;
        align-items: center;
        padding: var(--space-5) var(--space-4);
        border-bottom: 1px solid color-mix(in srgb, var(--text-secondary) 8%, transparent);
        transition: background-color var(--duration-normal) var(--ease-out);
        border-radius: var(--radius-sm);
    }

    .tracklist-item:hover {
        background-color: color-mix(in srgb, var(--accent) 5%, transparent);
    }

    .track-num {
        width: 2.75rem;
        opacity: 0.3;
        font-family: monospace;
    }

    .track-title {
        flex-grow: 1;
        font-size: var(--text-md);
    }

    .track-duration {
        opacity: 0.4;
        font-size: var(--text-sm);
    }

    @media (max-width: 1000px) {
        .album-detail {
            padding: calc(var(--layout-page-top) + var(--space-4)) var(--space-4) var(--space-8);
        }

        .content-wrapper {
            grid-template-columns: 1fr;
            gap: var(--space-6);
        }
    }

    @media (max-width: 640px), (any-pointer: coarse) {
        .album-cover {
            margin-bottom: var(--space-5);
        }

        .breadcrumb {
            flex-wrap: wrap;
            font-size: var(--text-base);
            margin-bottom: var(--space-4);
        }

        .release-date,
        .description {
            font-size: var(--text-base);
        }

        .links-grid {
            flex-direction: column;
            align-items: stretch;
        }

        .link-btn {
            display: flex;
            justify-content: center;
            padding: var(--space-3) var(--space-4);
            font-size: var(--text-base);
        }

        .tracklist-container h2 {
            font-size: var(--text-xl);
            letter-spacing: 0.2em;
            margin-bottom: var(--space-4);
        }

        .tracklist-item {
            padding: var(--space-4) var(--space-3);
            gap: var(--space-3);
            align-items: flex-start;
            flex-wrap: wrap;
        }

        .track-num {
            width: auto;
            min-width: 2ch;
        }

        .track-title {
            font-size: var(--text-base);
        }

        .track-duration {
            font-size: var(--text-sm);
            margin-left: auto;
        }
    }
</style>
