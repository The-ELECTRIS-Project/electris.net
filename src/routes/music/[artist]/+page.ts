import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { albums } from '$lib/data/music/albums';
import { artists } from '$lib/data/music/artists';
import { singles } from '$lib/data/music/singles';

export const load: PageLoad = ({ params }) => {
    const artist = artists.find(a => a.slug === params.artist);

    if (!artist) {
        throw error(404, 'Artist not found');
    }

    const artistSingles = singles.filter(s => s.artist === artist.name);
    const artistAlbums = albums.filter(a => a.artist === artist.name);

    return {
        artist,
        singles: artistSingles,
        albums: artistAlbums
    };
};
