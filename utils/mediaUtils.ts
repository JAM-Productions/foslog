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

// Utility function to map serie genre IDs to localized genre names
// ref: https://developer.themoviedb.org/reference/genre-tv-list
export const getSerieGenreByIdTMDB = (id: number): string => {
    const genreMap: { [key: number]: string } = {
        10759: 'actionAndAdventure',
        16: 'animation',
        35: 'comedy',
        80: 'crime',
        99: 'documentary',
        18: 'drama',
        10751: 'family',
        10762: 'kids',
        9648: 'mystery',
        10763: 'news',
        10764: 'reality',
        10765: 'sciFiAndFantasy',
        10766: 'soap',
        10767: 'talk',
        10768: 'warAndPolitics',
        37: 'western',
    };
    return genreMap[id] || 'unknown';
};

// Utility function to map game genre IDs to localized genre names
// ref: POST https://api.igdb.com/v4/genres
// body: fields name, slug;
//       limit 100;
export const getGameGenreByIdIGDB = (id: number): string => {
    const genreMap: { [key: number]: string } = {
        2: 'pointAndClick',
        4: 'fighting',
        5: 'shooter',
        7: 'music',
        8: 'platform',
        9: 'puzzle',
        10: 'racing',
        11: 'rts',
        12: 'rpg',
        13: 'simulator',
        14: 'sport',
        15: 'strategy',
        16: 'tbs',
        24: 'tactical',
        25: 'hackAndSlash',
        26: 'quizTrivia',
        30: 'pinball',
        31: 'adventure',
        32: 'indie',
        33: 'arcade',
        34: 'visualNovel',
        35: 'cardBoardGame',
        36: 'moba',
    };

    return genreMap[id] || 'unknown';
};

// Utility function to map game game-mode IDs to localized game-mode names
// ref: POST https://api.igdb.com/v4/game_modes
// body: fields name, slug;
//       limit 100;
export const getGameGameModeByIdIGDB = (id: number): string => {
    const gameModeMap: { [key: number]: string } = {
        1: 'singlePlayer',
        2: 'multiplayer',
        3: 'cooperative',
        4: 'splitScreen',
        5: 'mmo',
        6: 'battleRoyale',
    };

    return gameModeMap[id] || 'unknown';
};

// Utility function to map game perspective IDs to localized perspective names
// ref: POST https://api.igdb.com/v4/player_perspectives
// body: fields name, slug;
//       limit 100;
export const getGamePerspectiveByIdIGDB = (id: number): string => {
    const perspectiveMap: { [key: number]: string } = {
        1: 'firstPerson',
        2: 'thirdPerson',
        3: 'isometric',
        4: 'sideView',
        5: 'text',
        6: 'auditory',
        7: 'virtualReality',
    };

    return perspectiveMap[id] || 'unknown';
};

// Utility function to map game theme IDs to localized theme names
// ref: POST https://api.igdb.com/v4/themes
// body: fields name, slug;
//       limit 100;
export const getGameThemeByIdIGDB = (id: number): string => {
    const themeMap: { [key: number]: string } = {
        1: 'action',
        17: 'fantasy',
        18: 'sciFi',
        19: 'horror',
        20: 'thriller',
        21: 'survival',
        22: 'historical',
        23: 'stealth',
        27: 'comedy',
        28: 'business',
        31: 'drama',
        32: 'nonFiction',
        33: 'sandbox',
        34: 'educational',
        35: 'kids',
        38: 'openWorld',
        39: 'warfare',
        40: 'party',
        41: 'fourX',
        42: 'erotic',
        43: 'mystery',
        44: 'romance',
    };

    return themeMap[id] || 'unknown';
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
