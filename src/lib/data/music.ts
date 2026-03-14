import type { Artist, Single, Album } from '../types/music';

export const artists: Artist[] = [
    {
        name: 'ELECTRO',
        slug: 'ELECTRO',
        bio: 'Founding member of the ELECTRIS Project. A versatile creator exploring various musical landscapes.',
        avatar: '/icons/Logos/FirstParty/eltr-v10.png',
        links: {
            youtube: 'https://www.youtube.com/@ELEC7RO'
        },
        genre: ['Experimental', 'Indie', 'Rock', 'Hip-Hop', 'Rap'],
        artistFont: 'Letric'
    }
];

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

export const albums: Album[] = [
    // None for now
];
