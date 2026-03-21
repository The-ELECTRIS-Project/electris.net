import type { Artist, Single, Album } from '$lib/types/music';

export const singles: Single[] = [
    {
        title: 'Farewell, Apocalypse',
        slug: 'farewell-apocalypse',
        artist: 'ELECTRO',
        cover: 'https://i1.sndcdn.com/artworks-PpLyHdUlYokl1XBf-DcMRmA-t500x500.jpg',
        releaseDate: '2023-01-01',
        links: {
            youtube: 'https://youtu.be/zzrLzNRdY6o',
            soundcloud: 'https://soundcloud.com/electro-official/farewell-apocalypse'
        },
        artistFont: 'Letric'
    },
    {
        title: 'Zero',
        slug: 'Zero',
        artist: 'ELECTRO',
        cover: 'https://i1.sndcdn.com/artworks-DEJ2oIyB3AEYbg18-PNhitw-t500x500.jpg',
        releaseDate: '2023-03-01',
        links: {
            youtube: 'https://youtu.be/xVaTP_cPid0',
            soundcloud: 'https://soundcloud.com/electro_dev/zero'
        },
        titleFont: 'sans-serif',
        artistFont: 'Letric'
    }
];