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

// Utility function to map Google Books categories to localized genre names
export const getBookGenreByIdGoogle = (category: string): string => {
    const lower = category.toLowerCase();

    if (lower.includes('science fiction') || lower.includes('sci-fi')) return 'sciFi';
    if (lower.includes('action')) return 'action';
    if (lower.includes('adventure')) return 'adventure';
    if (lower.includes('fantasy')) return 'fantasy';
    if (lower.includes('mystery') || lower.includes('detective')) return 'mystery';
    if (lower.includes('horror')) return 'horror';
    if (lower.includes('thriller') || lower.includes('suspense')) return 'thriller';
    if (lower.includes('romance')) return 'romance';
    if (lower.includes('biography') || lower.includes('autobiography')) return 'biography';
    if (lower.includes('history') || lower.includes('historical')) return 'history';
    if (lower.includes('business') || lower.includes('economics')) return 'business';
    if (lower.includes('comics') || lower.includes('graphic novels')) return 'comics';
    if (lower.includes('cooking') || lower.includes('cookbooks')) return 'cooking';
    if (lower.includes('art') || lower.includes('photography')) return 'art';
    if (lower.includes('poetry')) return 'poetry';
    if (lower.includes('psychology')) return 'psychology';
    if (lower.includes('philosophy')) return 'philosophy';
    if (lower.includes('religion') || lower.includes('spirituality')) return 'religion';
    if (lower.includes('technology') || lower.includes('computers')) return 'technology';
    if (lower.includes('science') && !lower.includes('fiction')) return 'science';
    if (lower.includes('self-help') || lower.includes('self help')) return 'selfHelp';
    if (lower.includes('travel')) return 'travel';
    if (lower.includes('juvenile') || lower.includes('children')) return 'kids';
    if (lower.includes('education')) return 'educational';
    if (lower.includes('humor') || lower.includes('comedy')) return 'comedy';
    if (lower.includes('drama')) return 'drama';
    if (lower.includes('crime')) return 'crime';
    if (lower.includes('sports')) return 'sport';
    if (lower.includes('war')) return 'war';
    if (lower.includes('music')) return 'music';
    if (lower.includes('western')) return 'western';

    if (lower.includes('non-fiction') || lower.includes('non fiction')) return 'nonFiction';
    if (lower.includes('fiction')) return 'fiction';

    return 'unknown';
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
