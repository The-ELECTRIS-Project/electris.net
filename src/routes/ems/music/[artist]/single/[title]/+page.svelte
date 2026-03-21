<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
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
        (event.target as HTMLImageElement).src = '/icons/Logos/ThirdParty/yt.svg';
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
                <a href="/ems/music/{artist.slug}">{artist.name}</a>
                <span>/</span>
                <a href="/ems/music/{artist.slug}/singles">Singles</a>
            </nav>

            <h1 style="font-family: {single.titleFont || 'inherit'}">{single.title}</h1>
            <p class="artist-name" style="font-family: {single.artistFont || 'inherit'}">{single.artist}</p>
            
            {#if single.description}
                <p class="description">{single.description}</p>
            {/if}

            <div class="listen-links">
                <h3>LISTEN ON</h3>
                <div class="links-grid">
                    {#if single.links?.youtube}
                        <a href={single.links.youtube} target="_blank" class="link-btn yt option">
                            <img src="/icons/Logos/ThirdParty/yt.svg" alt="" onerror={handleImageError} />
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
        min-height: 90vmin;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10vmin 8.85vmin;
    }

    .content-wrapper {
        display: flex;
        gap: 10.62vmin;
        max-width: 1200px;
        width: 100%;
        align-items: center;
    }

    @media (max-width: 900px) {
        .content-wrapper {
            flex-direction: column;
            text-align: center;
        }
    }

    .cover-art {
        flex-shrink: 0;
        width: 450px;
        max-width: 100%;
        aspect-ratio: 1;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 30px 60px rgba(0,0,0,0.5);
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

    @media (max-width: 900px) {
        .track-info {
            text-align: center;
        }
    }

    .breadcrumb {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        font-size: 0.9rem;
        opacity: 0.6;
    }

    @media (max-width: 900px) {
        .breadcrumb {
            justify-content: center;
        }
    }

    .breadcrumb a {
        text-decoration: none;
        color: inherit;
    }

    .breadcrumb a:hover {
        color: var(--accent, #f65901);
    }

    .track-info h1 {
        font-size: 4.5rem;
        margin: 0;
        line-height: 1.1;
        color: var(--accent, #f65901);
    }

    .artist-name {
        font-size: 2rem;
        margin: 0.5rem 0 2rem;
        opacity: 0.8;
    }

    .description {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 3rem;
        opacity: 0.7;
        max-width: 500px;
    }

    @media (max-width: 900px) {
        .description {
            margin-left: auto;
            margin-right: auto;
        }
    }

    .listen-links h3 {
        font-size: 0.8rem;
        letter-spacing: 3px;
        margin-bottom: 1.5rem;
        opacity: 0.5;
    }

    .links-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    @media (max-width: 900px) {
        .links-grid {
            justify-content: center;
        }
    }

    .link-btn {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.8rem 1.5rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        text-decoration: none;
        color: white;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .link-btn:hover {
        background: rgba(246, 89, 1, 0.15);
        border-color: var(--accent, #f65901);
        transform: translateY(-3px);
    }

    .link-btn img {
        width: 20px;
        height: 20px;
    }
</style>
