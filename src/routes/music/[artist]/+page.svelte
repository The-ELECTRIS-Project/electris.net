<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { t } from '$lib/state/i18n.svelte';
    import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Crown from '../components/ui/Crown.svelte';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let { artist, singles, albums } = $derived(data);

    let container: HTMLElement;
    let avatar: HTMLImageElement;
    let name: HTMLElement;
    let bio: HTMLElement;

    useHoverConfig([
      {
        selectors: ['.artist-avatar'],
        className: 'hovered-avatar',
        lockPosition: true,
        dynamicSizeOffset: 0.9,
        dynamicBorderRadiusOffset: 10,
        color: '#fff'
      },
      {
        selectors: ['.hub-card'],
        className: 'hovered-artist-card',
        lockPosition: true,
        dynamicBorderRadiusOffset: 0.2,
        dynamicSizeOffset: {
            width: 0.75,
            height: 0.85
        }
      }
    ]);

    onMount(() => {
        gsap.from(container, { opacity: 0, y: 20, duration: 1, ease: 'power3.out' });
        gsap.from(avatar, { scale: 0.8, opacity: 0, duration: 1, delay: 0.2, ease: 'back.out(1.7)' });
        gsap.from(name, { y: 20, opacity: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' });
        gsap.from(bio, { y: 10, opacity: 0, duration: 0.8, delay: 0.6, ease: 'power2.out' });

        // Reset orbit class
        setTimeout(() => {
            const orbit = document.querySelector('.circle');
            if (orbit) orbit.className = 'circle';
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

    <div class="links-container wrap-no-interact-all">
        <Card href="/music/{artist.slug}/albums" class="hub-card">
            <div class="icon-bg">
                <img src="/icons/buttons/vinyl.svg" alt="Albums" />
            </div>
            <h2>{t('ems.music.card.vinyl', 'Albums')}</h2>
            <span class="count">{albums.length}</span>
        </Card>

        <Card href="/music/{artist.slug}/singles" class="hub-card">
            <div class="icon-bg">
                <img src="/icons/buttons/cd.svg" alt="Singles" />
            </div>
            <h2>{t('ems.music.card.disc', 'Singles')}</h2>
            <span class="count">{singles.length}</span>
        </Card>
    </div>

    {#if artist.slug === 'ELECTRO'}
        <Crown />
    {/if}
</div>

<style>
    .artist-hub {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: var(--layout-page-top);
    }

    .artist-header {
        text-align: center;
        max-width: var(--layout-measure);
        margin-bottom: 6rem;
    }

    .avatar-container {
        width: 12rem;
        height: 12rem;
        border-radius: var(--radius-round);
        overflow: hidden;
        border: 3px solid var(--accent);
        margin: 0 auto var(--space-6);
        box-shadow: var(--shadow-md);
        transition: border-color var(--duration-normal) var(--ease-out);
    }

    .artist-avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .artist-header h1 {
        font-size: var(--display-md);
        margin: 0 0 var(--space-4);
        color: var(--accent);
    }

    .bio {
        font-size: var(--text-lg);
        opacity: 0.8;
        line-height: 1.6;
    }

    .links-container {
        display: flex;
        gap: var(--space-8);
        justify-content: center;
        width: 100%;
        padding: 0 var(--space-6);
    }

    .links-container :global(.hub-card) {
        --card-lift: -0.7rem;
        border-radius: var(--radius-xl);
        padding: var(--space-7);
        width: 19rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
    }

    .icon-bg {
        width: 5.5rem;
        height: 5.5rem;
        background: color-mix(in srgb, var(--accent) 10%, transparent);
        border-radius: var(--radius-round);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: var(--space-5);
    }

    .icon-bg img {
        width: 2.75rem;
        height: 2.75rem;
    }

    :global(.hub-card) h2 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        margin: 0;
        color: var(--accent);
    }

    .count {
        position: absolute;
        top: var(--space-4);
        right: var(--space-5);
        font-size: var(--text-xl);
        font-weight: bold;
        opacity: 0.3;
    }

    @media (max-width: 900px), (any-pointer: coarse) {
        .artist-hub {
            min-height: auto;
            padding: calc(var(--layout-page-top) + var(--space-4)) var(--space-4) var(--space-8);
        }

        .artist-header {
            max-width: 36rem;
            margin-bottom: var(--space-7);
        }

        .avatar-container {
            width: 9rem;
            height: 9rem;
            margin-bottom: var(--space-5);
        }

        .bio {
            font-size: var(--text-md);
        }

        .links-container {
            gap: var(--space-4);
            padding: 0;
            flex-direction: column;
            align-items: stretch;
            max-width: 32rem;
        }

        .links-container :global(.hub-card) {
            width: 100%;
            padding: var(--space-6) var(--space-5);
            border-radius: var(--radius-lg);
        }

        .icon-bg {
            width: 4.25rem;
            height: 4.25rem;
            margin-bottom: var(--space-4);
        }

        .icon-bg img {
            width: var(--space-6);
            height: var(--space-6);
        }

        :global(.hub-card) h2 {
            font-size: var(--text-xl);
        }

        .count {
            top: var(--space-4);
            right: var(--space-4);
            font-size: var(--text-lg);
        }
    }
</style>
