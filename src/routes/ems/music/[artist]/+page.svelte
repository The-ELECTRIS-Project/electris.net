<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/stores/i18n';
    import { useHoverConfig } from '$lib/stores/hoverConfig';
    import Crown from '$lib/UI/music/Crown.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    const { artist, singles, albums } = data;

    let container: HTMLElement;
    let avatar: HTMLImageElement;
    let name: HTMLElement;
    let bio: HTMLElement;

    useHoverConfig([
      {
        type: [ 'img' ],
        selectors: ['.artist-avatar'],
        className: 'hovered-avatar',
        lockPosition: true
      }
    ]);

    onMount(() => {
        gsap.from(container, { opacity: 0, y: 20, duration: 1, ease: 'power3.out' });
        gsap.from(avatar, { scale: 0.8, opacity: 0, duration: 1, delay: 0.2, ease: 'back.out(1.7)' });
        gsap.from(name, { y: 20, opacity: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' });
        gsap.from(bio, { y: 10, opacity: 0, duration: 0.8, delay: 0.6, ease: 'power2.out' });

        // Reset cursor class
        setTimeout(() => {
            const c = document.querySelector('.circle');
            if (c) c.className = 'circle';
        }, 10);
    });
</script>

<svelte:head>
    <title>{artist.name} | Music | ELECTRIS</title>
</svelte:head>

<div class="artist-hub" bind:this={container}>
    <header class="artist-header">
        <div class="avatar-container">
            <img 
                bind:this={avatar}
                src={artist.avatar} 
                alt={artist.name} 
                class="artist-avatar" 
            />
        </div>
        <h1 bind:this={name} style="font-family: {artist.artistFont || 'inherit'}">{artist.name}</h1>
        <p bind:this={bio} class="bio">{artist.bio}</p>
    </header>

    <div class="links-container">
        <a 
            href="/ems/music/{artist.slug}/albums" 
            class="hub-card card"
        >
            <div class="icon-bg">
                <img src="/icons/buttons/vinyl.svg" alt="Albums" />
            </div>
            <h2>{$t('ems.music.card.vinyl', 'Albums')}</h2>
            <span class="count">{albums.length}</span>
        </a>

        <a 
            href="/ems/music/{artist.slug}/singles" 
            class="hub-card card"
        >
            <div class="icon-bg">
                <img src="/icons/buttons/cd.svg" alt="Singles" />
            </div>
            <h2>{$t('ems.music.card.disc', 'Singles')}</h2>
            <span class="count">{singles.length}</span>
        </a>
    </div>

    {#if artist.slug === 'ELECTRO'}
        <Crown />
    {/if}
</div>

<style>
    body {
        overflow: hidden;
    }
    
    .artist-hub {
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 10vh;
    }

    .artist-header {
        text-align: center;
        max-width: 600px;
        margin-bottom: 8vh;
    }

    .avatar-container {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid var(--accent, #f65901);
        margin: 0 auto 2rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transition: border-color 0.3s;
    }

    .artist-avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .artist-header h1 {
        font-size: 4rem;
        margin: 0 0 1rem;
        color: var(--accent, #f65901);
    }

    .bio {
        font-size: 1.2rem;
        opacity: 0.8;
        line-height: 1.6;
    }

    .links-container {
        display: flex;
        gap: 4vw;
        justify-content: center;
        width: 100%;
        padding: 0 2rem;
    }

    .hub-card {
        background: rgba(246, 89, 1, 0.05);
        border: 1px solid rgba(246, 89, 1, 0.2);
        border-radius: 20px;
        padding: 3rem;
        width: 280px;
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .hub-card:hover {
        background: rgba(246, 89, 1, 0.1);
        border-color: rgba(246, 89, 1, 0.5);
        transform: translateY(-10px);
    }

    .icon-bg {
        width: 80px;
        height: 80px;
        background: rgba(246, 89, 1, 0.1);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .icon-bg img {
        width: 40px;
        height: 40px;
    }

    .hub-card h2 {
        font-family: 'Letric';
        font-size: 2rem;
        margin: 0;
        color: var(--accent, #f65901);
    }

    .count {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        font-size: 1.5rem;
        font-weight: bold;
        opacity: 0.3;
    }
</style>
