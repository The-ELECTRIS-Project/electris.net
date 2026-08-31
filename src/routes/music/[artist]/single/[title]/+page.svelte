<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/state/i18n.svelte';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let { artist, single } = $derived(data);

    onMount(() => {
        gsap.from('.cover-art', { scale: 0.9, opacity: 0, duration: 1, ease: 'power3.out' });
        gsap.from('.track-info > *', { y: 20, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' });
        
        setTimeout(() => {
            const c = document.querySelector('.circle');
            if (c) c.className = 'circle';
        }, 10);
    });

    function handleImageError(event: Event) {
        (event.target as HTMLImageElement).src = '/icons/logo/ThirdParty/yt.svg';
    }
</script>

<svelte:head>
    <title>{single.title} | {artist.name} | ELECTRIS</title>
</svelte:head>

<div class="single-detail">
    <div class="content-wrapper">
        <div class="cover-art">
            <img src={single.cover} alt={single.title} />
        </div>
        
        <div class="track-info">
            <nav class="breadcrumb">
                <a href="/music/{artist.slug}">{artist.name}</a>
                <span>/</span>
                <a href="/music/{artist.slug}/singles">{t('ems.music.card.disc', 'Singles')}</a>
            </nav>

            <h1 style="font-family: {single.titleFont || 'inherit'}">{single.title}</h1>
            <p class="artist-name" style="font-family: {single.artistFont || 'inherit'}">{single.artist}</p>
            
            {#if single.description}
                <p class="description">{single.description}</p>
            {/if}

            <div class="listen-links">
                <h3>{t('ems.music.single.listen', 'Listen on')}</h3>
                <div class="links-grid">
                    {#if single.links?.youtube}
                        <a href={single.links.youtube} target="_blank" class="link-btn yt option">
                            <img src="/icons/logo/ThirdParty/yt.svg" alt="" onerror={handleImageError} />
                            YouTube
                        </a>
                    {/if}
                    {#if single.links?.soundcloud}
                        <a href={single.links.soundcloud} target="_blank" class="link-btn sc option">
                            SoundCloud
                        </a>
                    {/if}
                    {#if single.links?.spotify}
                        <a href={single.links.spotify} target="_blank" class="link-btn spot option">
                            Spotify
                        </a>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .single-detail {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
    }

    .content-wrapper {
        display: flex;
        gap: 8rem;
        max-width: var(--layout-max);
        width: 100%;
        align-items: center;
    }

    .cover-art {
        flex-shrink: 0;
        width: 30rem;
        max-width: 100%;
        aspect-ratio: 1;
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
    }

    .cover-art img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .track-info {
        flex-grow: 1;
        text-align: left;
    }

    .breadcrumb {
        display: flex;
        gap: var(--space-2);
        margin-bottom: var(--space-6);
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

    .track-info h1 {
        font-size: var(--display-lg);
        margin: 0;
        line-height: 1.1;
        color: var(--accent);
    }

    .artist-name {
        font-size: var(--text-2xl);
        margin: var(--space-2) 0 var(--space-6);
        opacity: 0.8;
    }

    .description {
        font-size: var(--text-md);
        line-height: 1.6;
        margin-bottom: var(--space-7);
        opacity: 0.7;
        max-width: 34rem;
    }

    .listen-links h3 {
        font-size: var(--text-xs);
        text-transform: uppercase;
        letter-spacing: 0.25em;
        margin-bottom: var(--space-5);
        opacity: 0.5;
    }

    .links-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-4);
    }

    .link-btn {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-5);
        background: color-mix(in srgb, var(--text-secondary) 6%, transparent);
        border: 1px solid color-mix(in srgb, var(--text-secondary) 12%, transparent);
        border-radius: var(--radius-md);
        text-decoration: none;
        color: var(--text-secondary);
        font-weight: bold;
        transition:
            var(--transition-colors),
            transform var(--duration-normal) var(--ease-out);
    }

    .link-btn:hover {
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        border-color: var(--accent);
        transform: translateY(-0.2rem);
    }

    .link-btn img {
        width: 1.4rem;
        height: 1.4rem;
    }

    @media (max-width: 900px) {
        .single-detail {
            padding: calc(var(--layout-page-top) + var(--space-4)) var(--space-4) var(--space-8);
            align-items: flex-start;
        }

        .content-wrapper {
            flex-direction: column;
            gap: var(--space-6);
            text-align: center;
        }

        .cover-art {
            width: min(100%, 22rem);
            border-radius: var(--radius-lg);
        }

        .track-info {
            text-align: center;
        }

        .breadcrumb {
            justify-content: center;
        }

        .artist-name {
            font-size: var(--text-xl);
            margin-bottom: var(--space-5);
        }

        .description {
            font-size: var(--text-base);
            margin-bottom: var(--space-6);
            margin-left: auto;
            margin-right: auto;
        }

        .listen-links h3 {
            font-size: var(--text-sm);
        }

        .links-grid {
            justify-content: center;
            width: 100%;
        }

        .link-btn {
            flex: 1 1 12rem;
            justify-content: center;
            min-height: 3rem;
            font-size: var(--text-base);
        }
    }

    @media (max-width: 560px) {
        .links-grid {
            flex-direction: column;
        }

        .link-btn {
            width: 100%;
        }
    }
</style>
