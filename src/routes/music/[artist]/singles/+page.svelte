<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/state/i18n.svelte';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let { artist, singles } = $derived(data);

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
            <a href="/music/{artist.slug}" class="btn-return">Return to Artist</a>
        </div>
    {/if}
</div>

<style>
    .singles-page {
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

    .singles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
        gap: var(--space-7);
    }

    .single-card {
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

    .overlay {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--accent) 35%, transparent);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity var(--duration-normal) var(--ease-out);
    }

    .overlay span {
        color: var(--text-on-accent);
        font-weight: bold;
        letter-spacing: 0.15em;
        font-size: var(--text-sm);
    }

    .single-card:hover .cover-img {
        transform: scale(1.1);
    }

    .single-card:hover .overlay {
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

    .none-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding-top: var(--space-8);
    }

    .empty-icon {
        width: 8rem;
        height: 8rem;
        background: color-mix(in srgb, var(--accent) 10%, transparent);
        border-radius: var(--radius-round);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: var(--space-6);
        opacity: 0.5;
    }

    .empty-icon img {
        width: var(--space-8);
        opacity: 0.5;
    }

    .none-found h2 {
        font-family: var(--font-display);
        font-size: var(--display-sm);
        margin-bottom: var(--space-4);
        opacity: 0.8;
    }

    .none-found p {
        max-width: 27rem;
        opacity: 0.6;
        margin-bottom: var(--space-6);
    }

    .btn-return {
        padding: var(--space-3) var(--space-6);
        border: 1px solid var(--accent);
        color: var(--accent);
        text-decoration: none;
        border-radius: var(--radius-pill);
        transition: var(--transition-colors);
    }

    .btn-return:hover {
        background: var(--accent);
        color: var(--text-on-accent);
    }
</style>
