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
                    <a href="/ems/music/{artist.slug}">{artist.name}</a>
                    <span>/</span>
                    <a href="/ems/music/{artist.slug}/albums">Albums</a>
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
        min-height: 90vmin;
        padding: 12vmin 8.85vmin 5vmin;
    }

    .content-wrapper {
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: 14.16vmin;
        max-width: 1400px;
        margin: 0 auto;
    }

    @media (max-width: 1000px) {
        .content-wrapper {
            grid-template-columns: 1fr;
        }
    }

    .album-cover {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        margin-bottom: 3rem;
    }

    .album-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .breadcrumb {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        opacity: 0.6;
    }

    .breadcrumb a {
        text-decoration: none;
        color: inherit;
    }

    .breadcrumb a:hover {
        color: var(--accent, #f65901);
    }

    .album-meta h1 {
        font-size: 3.5rem;
        margin: 0;
        color: var(--accent, #f65901);
        line-height: 1.1;
    }

    .release-date {
        opacity: 0.5;
        margin: 0.5rem 0 2rem;
    }

    .description {
        line-height: 1.6;
        opacity: 0.8;
        margin-bottom: 2rem;
    }

    .links-grid {
        display: flex;
        gap: 1rem;
    }

    .link-btn {
        padding: 0.6rem 1.2rem;
        border: 1px solid rgba(246, 89, 1, 0.3);
        border-radius: 6px;
        text-decoration: none;
        color: var(--accent, #f65901);
        font-weight: bold;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }

    .link-btn:hover {
        background: var(--accent, #f65901);
        color: white;
    }

    .tracklist-container h2 {
        font-family: 'Letric';
        font-size: 2rem;
        letter-spacing: 4px;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        color: var(--accent, #f65901);
    }

    .tracklist {
        display: flex;
        flex-direction: column;
    }

    .tracklist-item {
        display: flex;
        align-items: center;
        padding: 1.2rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        transition: background 0.2s ease;
        border-radius: 8px;
    }

    .tracklist-item:hover {
        background: rgba(246, 89, 1, 0.05);
    }

    .track-num {
        width: 40px;
        opacity: 0.3;
        font-family: monospace;
    }

    .track-title {
        flex-grow: 1;
        font-size: 1.1rem;
    }

    .track-duration {
        opacity: 0.4;
        font-size: 0.9rem;
    }
</style>
