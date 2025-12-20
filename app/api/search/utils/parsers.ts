import { MediaType } from '@prisma/client';
import {
    getGameGameModeByIdIGDB,
    getGameGenreByIdIGDB,
    getGamePerspectiveByIdIGDB,
    getGameThemeByIdIGDB,
    getMovieGenreByIdTMDB,
    getSerieGenreByIdTMDB,
} from '@/utils/mediaUtils';

interface TMDBDataMovie {
    title: string;
    poster_path: string | null;
    release_date: string | null;
    overview: string | null;
    genre_ids: number[];
}

interface TMDBDataSerie {
    name: string;
    poster_path: string | null;
    first_air_date: string | null;
    overview: string | null;
    genre_ids: number[];
}

interface IGDBDataGame {
    name: string;
    cover: { id: number; url: string } | null;
    first_release_date: number | null;
    genres: number[] | null;
    game_modes: number[] | null;
    player_perspectives: number[] | null;
    themes: number[] | null;
    summary: string | null;
}

export const parseTMDBMovie = (item: TMDBDataMovie) => ({
    title: item.title,
    type: MediaType.FILM,
    year: item.release_date ? parseInt(item.release_date.split('-')[0]) : null,
    poster: item.poster_path
        ? 'https://image.tmdb.org/t/p/w500' + item.poster_path
        : null,
    description: item.overview || '',
    genre: item.genre_ids?.map((id: number) => getMovieGenreByIdTMDB(id)) || [],
});

export const parseTMDBSerie = (item: TMDBDataSerie) => ({
    title: item.name,
    type: MediaType.SERIES,
    year: item.first_air_date
        ? parseInt(item.first_air_date.split('-')[0])
        : null,
    poster: item.poster_path
        ? 'https://image.tmdb.org/t/p/w500' + item.poster_path
        : null,
    description: item.overview || '',
    genre: item.genre_ids?.map((id: number) => getSerieGenreByIdTMDB(id)) || [],
});

export const parseIGDBGame = (item: IGDBDataGame) => ({
    title: item.name,
    type: MediaType.GAME,
    year: item.first_release_date
        ? new Date(item.first_release_date * 1000).getFullYear()
        : null,
    poster: item.cover
        ? 'https:' + item.cover.url.replace(/t_[a-z0-9_]+/, 't_1080p')
        : null,
    description: item.summary || '',
    genre: [
        ...(item.genres?.map((id: number) => getGameGenreByIdIGDB(id)) || []),
        ...(item.game_modes?.map((id: number) => getGameGameModeByIdIGDB(id)) ||
            []),
        ...(item.player_perspectives?.map((id: number) =>
            getGamePerspectiveByIdIGDB(id)
        ) || []),
        ...(item.themes?.map((id: number) => getGameThemeByIdIGDB(id)) || []),
    ],
});
