import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { artists, singles } from '$lib/data/music';

export const load: PageLoad = ({ params }) => {
    const artist = artists.find(a => a.slug === params.artist);

    if (!artist) {
        throw error(404, 'Artist not found');
    }

    const artistSingles = singles.filter(s => s.artist === artist.name);

    return {
        artist,
        singles: artistSingles
    };
};
