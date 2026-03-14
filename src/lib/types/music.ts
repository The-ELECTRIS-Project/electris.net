export interface Song {
    title: string;
    slug: string;
    duration?: string;
    links?: {
        spotify?: string;
        youtube?: string;
        appleMusic?: string;
        soundcloud?: string;
    };
}

export interface Single extends Song {
    cover: string;
    releaseDate: string;
    artist: string;
    description?: string;
    titleFont?: string;
    artistFont?: string;
}

export interface Album {
    title: string;
    slug: string;
    cover: string;
    releaseDate: string;
    artist: string;
    description?: string;
    tracks: Song[];
    links?: {
        spotify?: string;
        youtube?: string;
        appleMusic?: string;
        soundcloud?: string;
    };
    titleFont?: string;
    artistFont?: string;
}

export interface Artist {
    name: string;
    slug: string;
    bio: string;
    avatar: string;
    links?: {
        twitter?: string;
        instagram?: string;
        spotify?: string;
        youtube?: string;
    };
    genre?: string[];
    artistFont?: string;
}
