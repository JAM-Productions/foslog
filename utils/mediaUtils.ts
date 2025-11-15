import { MediaItem } from '@/lib/store';

// Utility function to map movie genre IDs to localized genre names
// ref: https://developer.themoviedb.org/reference/genre-movie-list
const getMovieGenreById = (id: number, t: (key: string) => string): string => {
    const genreMap: { [key: number]: string } = {
        28: t('action'),
        12: t('adventure'),
        16: t('animation'),
        35: t('comedy'),
        80: t('crime'),
        99: t('documentary'),
        18: t('drama'),
        10751: t('family'),
        14: t('fantasy'),
        36: t('history'),
        27: t('horror'),
        10402: t('music'),
        9648: t('mystery'),
        10749: t('romance'),
        878: t('sciFi'),
        10770: t('tvMovie'),
        53: t('thriller'),
        10752: t('war'),
        37: t('western'),
    };
    return genreMap[id] || t('unknown');
};

// General utility function to get genre label based on media type
export const getMediaGenreLabel = (
    type: MediaItem['type'],
    genreId: number,
    tGenres: (key: string) => string
): string => {
    switch (type) {
        case 'film':
            return getMovieGenreById(genreId, tGenres);
        // Future media types can be handled here
        default:
            return 'unknown';
    }
};
