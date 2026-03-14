<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/stores/i18n';
    import type { PageData } from './$types';

    export let data: PageData;

    const { artist, singles } = data;

    let container: HTMLElement;

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

<div class="singles-page" bind:this={container}>
    <header class="page-header">
        <a href="/ems/music/{artist.slug}" class="back-link">
            ← {artist.name}
        </a>
        <h1>{$t('ems.music.card.disc', 'Singles')}</h1>
    </header>

    {#if singles.length > 0}
        <div class="singles-grid">
            {#each singles as single}
                <a 
                    href="/ems/music/{artist.slug}/single/{single.slug}" 
                    class="single-card card"
                >
                    <div class="cover-wrapper">
                        <img src={single.cover} alt={single.title} class="cover-img" />
                        <div class="overlay">
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
        <div class="none-found">
            <div class="empty-icon">
                <img src="/icons/buttons/cd.svg" alt="Empty" />
            </div>
            <h2>NO SINGLES YET</h2>
            <p>{artist.name} hasn't released any singles with ELECTRIS yet. When they do, they'll appear here!</p>
            <a href="/ems/music/{artist.slug}" class="btn-return">Return to Artist</a>
        </div>
    {/if}
</div>

<style>
    .singles-page {
        min-height: 90vh;
        padding: 10vh 5vw 5vh;
    }

    .page-header {
        margin-bottom: 6vh;
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

    .singles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 3rem;
    }

    .single-card {
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease;
    }

    .cover-wrapper {
        position: relative;
        aspect-ratio: 1;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 1.2rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }

    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(246, 89, 1, 0.35);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .overlay span {
        color: white;
        font-weight: bold;
        letter-spacing: 2px;
        font-size: 0.9rem;
    }

    .single-card:hover .cover-img {
        transform: scale(1.1);
    }

    .single-card:hover .overlay {
        opacity: 1;
    }

    .info h3 {
        margin: 0;
        font-size: 1.4rem;
        color: var(--accent, #f65901);
    }

    .info p {
        margin: 0.3rem 0 0;
        opacity: 0.6;
        font-size: 0.9rem;
    }

    .none-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding-top: 10vh;
    }

    .empty-icon {
        width: 120px;
        height: 120px;
        background: rgba(246, 89, 1, 0.1);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;
        opacity: 0.5;
    }

    .empty-icon img {
        width: 60px;
        opacity: 0.5;
    }

    .none-found h2 {
        font-family: 'Letric';
        font-size: 2.5rem;
        margin-bottom: 1rem;
        opacity: 0.8;
    }

    .none-found p {
        max-width: 400px;
        opacity: 0.6;
        margin-bottom: 2rem;
    }

    .btn-return {
        padding: 0.8rem 2rem;
        border: 1px solid var(--accent, #f65901);
        color: var(--accent, #f65901);
        text-decoration: none;
        border-radius: 30px;
        transition: all 0.3s ease;
    }

    .btn-return:hover {
        background: var(--accent, #f65901);
        color: white;
    }
</style>
