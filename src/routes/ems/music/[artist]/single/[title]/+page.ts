import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { artists } from '$lib/data/music/artists';
import { singles } from '$lib/data/music/singles';

export const load: PageLoad = ({ params }) => {
    const artist = artists.find(a => a.slug === params.artist);
    if (!artist) throw error(404, 'Artist not found');

    const single = singles.find(s => s.slug === params.title && s.artist === artist.name);
    if (!single) throw error(404, 'Single not found');

    return {
        artist,
        single
    };
};
