import { MediaItem } from '@/lib/store';

// Utility function to map movie genre IDs to localized genre names
// ref: https://developer.themoviedb.org/reference/genre-movie-list
export const getMovieGenreByIdTMDB = (id: number): string => {
    const genreMap: { [key: number]: string } = {
        28: 'action',
        12: 'adventure',
        16: 'animation',
        35: 'comedy',
        80: 'crime',
        99: 'documentary',
        18: 'drama',
        10751: 'family',
        14: 'fantasy',
        36: 'history',
        27: 'horror',
        10402: 'music',
        9648: 'mystery',
        10749: 'romance',
        878: 'sciFi',
        10770: 'tvMovie',
        53: 'thriller',
        10752: 'war',
        37: 'western',
    };
    return genreMap[id] || 'unknown';
};

// General utility function to get genre label based on media type
export const getMediaGenreLabel = (
    type: MediaItem['type'],
    genreId: number
): string => {
    switch (type) {
        case 'film':
            return getMovieGenreByIdTMDB(genreId);
        // Future media types can be handled here
        default:
            return genreId ? genreId.toString() : '';
    }
};
