import { describe, it, expect, vi } from 'vitest';
import {
    parseTMDBMovie,
    parseTMDBSerie,
    parseIGDBGame,
} from '@/app/api/search/utils/parsers';
import { MediaType } from '@prisma/client';

vi.mock('@/utils/mediaUtils', () => ({
    getMovieGenreByIdTMDB: (id: number) => `MovieGenre${id}`,
    getSerieGenreByIdTMDB: (id: number) => `SerieGenre${id}`,
    getGameGenreByIdIGDB: (id: number) => `GameGenre${id}`,
    getGameGameModeByIdIGDB: (id: number) => `GameMode${id}`,
    getGamePerspectiveByIdIGDB: (id: number) => `GamePerspective${id}`,
    getGameThemeByIdIGDB: (id: number) => `GameTheme${id}`,
}));

describe('API Parsers', () => {
    describe('parseTMDBMovie', () => {
        it('should correctly parse a TMDB movie object', () => {
            const movieData = {
                title: 'Test Movie',
                poster_path: '/test.jpg',
                release_date: '2023-01-01',
                overview: 'This is a test movie.',
                genre_ids: [1, 2],
            };

            const expected = {
                title: 'Test Movie',
                type: MediaType.FILM,
                year: 2023,
                poster: 'https://image.tmdb.org/t/p/w500/test.jpg',
                description: 'This is a test movie.',
                genre: ['MovieGenre1', 'MovieGenre2'],
            };

            expect(parseTMDBMovie(movieData)).toEqual(expected);
        });
    });

    describe('parseTMDBSerie', () => {
        it('should correctly parse a TMDB serie object', () => {
            const serieData = {
                name: 'Test Serie',
                poster_path: '/test.jpg',
                first_air_date: '2023-01-01',
                overview: 'This is a test serie.',
                genre_ids: [1, 2],
            };

            const expected = {
                title: 'Test Serie',
                type: MediaType.SERIES,
                year: 2023,
                poster: 'https://image.tmdb.org/t/p/w500/test.jpg',
                description: 'This is a test serie.',
                genre: ['SerieGenre1', 'SerieGenre2'],
            };

            expect(parseTMDBSerie(serieData)).toEqual(expected);
        });
    });

    describe('parseIGDBGame', () => {
        it('should correctly parse an IGDB game object', () => {
            const gameData = {
                name: 'Test Game',
                cover: { id: 1, url: '//images.igdb.com/igdb/image/upload/t_thumb/test.jpg' },
                first_release_date: 1672531200, // 2023-01-01
                genres: [1],
                game_modes: [2],
                player_perspectives: [3],
                themes: [4],
                summary: 'This is a test game.',
            };

            const expected = {
                title: 'Test Game',
                type: MediaType.GAME,
                year: 2023,
                poster: 'https://images.igdb.com/igdb/image/upload/t_1080p/test.jpg',
                description: 'This is a test game.',
                genre: ['GameGenre1', 'GameMode2', 'GamePerspective3', 'GameTheme4'],
            };

            expect(parseIGDBGame(gameData)).toEqual(expected);
        });
    });
});
