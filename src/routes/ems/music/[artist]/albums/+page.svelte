<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/stores/i18n';
    import type { PageData } from './$types';

    export let data: PageData;

    const { artist, albums } = data;

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
        <a href="/ems/music/{artist.slug}" class="back-link">
            ← {artist.name}
        </a>
        <h1>{$t('ems.music.card.vinyl', 'Albums')}</h1>
    </header>

    {#if albums.length > 0}
        <div class="albums-grid">
            {#each albums as album}
                <a 
                    href="/ems/music/{artist.slug}/album/{album.slug}" 
                    class="album-card card"
                >
                    <div class="cover-wrapper">
                        <img src={album.cover} alt={album.title} class="cover-img" />
                        <div class="overlay">
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
            <a href="/ems/music/{artist.slug}" class="btn-return">Return to Artist</a>
        </div>
    {/if}
</div>

<style>
    .albums-page {
        min-height: 90vmin;
        padding: 10vmin 8.85vmin 5vmin;
    }

    .page-header {
        margin-bottom: 6vmin;
    }

    .back-link {
        text-decoration: none;
        color: var(--accent, #f65901);
        font-weight: bold;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .back-link:hover {
        opacity: 1;
    }

    .page-header h1 {
        font-family: 'Letric';
        font-size: 3.5rem;
        margin: 1rem 0 0;
        color: var(--accent, #f65901);
    }

    .albums-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 4rem;
    }

    .album-card {
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease;
    }

    .cover-wrapper {
        position: relative;
        aspect-ratio: 1;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 1.5rem;
        box-shadow: 0 15px 40px rgba(0,0,0,0.4);
    }

    .cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(246, 89, 1, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .overlay span {
        color: white;
        font-weight: bold;
        letter-spacing: 3px;
        font-size: 1rem;
    }

    .album-card:hover .cover-img {
        transform: scale(1.05);
    }

    .album-card:hover .overlay {
        opacity: 1;
    }

    .info h3 {
        margin: 0;
        font-size: 1.6rem;
        color: var(--accent, #f65901);
    }

    .info p {
        margin: 0.4rem 0 0;
        opacity: 0.7;
        font-size: 1rem;
    }

    .none-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding-top: 10vmin;
    }

    .empty-icon {
        width: 140px;
        height: 140px;
        background: rgba(246, 89, 1, 0.05);
        border: 1px dashed rgba(246, 89, 1, 0.3);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 2.5rem;
    }

    .empty-icon img {
        width: 70px;
        opacity: 0.3;
        animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .none-found h2 {
        font-family: 'Letric';
        font-size: 3rem;
        margin-bottom: 1.2rem;
        opacity: 0.8;
        color: var(--accent, #f65901);
    }

    .none-found p {
        max-width: 450px;
        opacity: 0.6;
        margin-bottom: 2.5rem;
        line-height: 1.6;
    }

    .btn-return {
        padding: 1rem 2.5rem;
        background: transparent;
        border: 1px solid var(--accent, #f65901);
        color: var(--accent, #f65901);
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        letter-spacing: 1px;
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .btn-return:hover {
        background: var(--accent, #f65901);
        color: white;
        box-shadow: 0 5px 15px rgba(246, 89, 1, 0.3);
    }
</style>
