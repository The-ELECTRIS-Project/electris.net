import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { artists, albums } from '$lib/data/music';

export const load: PageLoad = ({ params }) => {
    const artist = artists.find(a => a.slug === params.artist);

    if (!artist) {
        throw error(404, 'Artist not found');
    }

    const artistAlbums = albums.filter(a => a.artist === artist.name);

    return {
        artist,
        albums: artistAlbums
    };
};
