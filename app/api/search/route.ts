import { MediaType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { badGateway, internalServerError, validationError } from '@/lib/errors';
import {
    getGameGenreByIdIGDB,
    getGameGameModeByIdIGDB,
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

export async function GET(req: NextRequest) {
    try {
        const mediatype = req.nextUrl.searchParams.get('mediatype');
        const mediatitle = req.nextUrl.searchParams.get('mediatitle');

        if (!mediatype) {
            return validationError('Mediatype is required');
        }

        if (!mediatitle) {
            return validationError('Mediatitle is required');
        }

        let apiUrl = '';

        switch (mediatype) {
            case 'film':
                apiUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
                    mediatitle
                )}`;
                const res = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    },
                });
                if (!res.ok) {
                    return badGateway('Could not fetch data from TMDB API');
                }
                const data = await res.json();
                const formattedResult =
                    data.results?.map((item: TMDBDataMovie) => ({
                        title: item.title,
                        type: MediaType.FILM,
                        year: item.release_date
                            ? parseInt(item.release_date.split('-')[0])
                            : null,
                        poster: item.poster_path
                            ? 'https://image.tmdb.org/t/p/w500' +
                              item.poster_path
                            : null,
                        description: item.overview || '',
                        genre:
                            item.genre_ids?.map((id: number) =>
                                getMovieGenreByIdTMDB(id)
                            ) || [],
                    })) || [];
                return NextResponse.json(formattedResult);

            case 'serie':
                apiUrl = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
                    mediatitle
                )}`;
                const resSeries = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    },
                });
                if (!resSeries.ok) {
                    return badGateway('Could not fetch data from TMDB API');
                }
                const dataSeries = await resSeries.json();
                const formattedResultSeries =
                    dataSeries.results?.map((item: TMDBDataSerie) => ({
                        title: item.name,
                        type: MediaType.SERIES,
                        year: item.first_air_date
                            ? parseInt(item.first_air_date.split('-')[0])
                            : null,
                        poster: item.poster_path
                            ? 'https://image.tmdb.org/t/p/w500' +
                              item.poster_path
                            : null,
                        description: item.overview || '',
                        genre:
                            item.genre_ids?.map((id: number) =>
                                getSerieGenreByIdTMDB(id)
                            ) || [],
                    })) || [];
                return NextResponse.json(formattedResultSeries);

            case 'game':
                const tokenRes = await fetch(
                    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_SECRET}&grant_type=client_credentials`,
                    {
                        method: 'POST',
                    }
                );
                const tokenData = await tokenRes.json();
                const accessToken = tokenData.access_token;
                apiUrl = `https://api.igdb.com/v4/games`;
                const apicalypseQuery = `search "${mediatitle}"; fields id,name,cover.url,first_release_date,genres,summary,game_modes,player_perspectives,themes; limit 10;`;
                const resGames = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Client-ID': process.env.IGDB_CLIENT_ID || '',
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'text/plain',
                    },
                    body: apicalypseQuery,
                });
                if (!resGames.ok) {
                    return badGateway('Could not fetch data from IGDB API');
                }
                const dataGames = await resGames.json();
                const formattedResultGames =
                    dataGames?.map((item: IGDBDataGame) => ({
                        title: item.name,
                        type: MediaType.GAME,
                        year: item.first_release_date
                            ? new Date(
                                  item.first_release_date * 1000
                              ).getFullYear()
                            : null,
                        poster: item.cover
                            ? 'https:' +
                              item.cover.url.replace(/t_[a-z0-9_]+/, 't_1080p')
                            : null,
                        description: item.summary || '',
                        genre: [
                            ...(item.genres?.map((id: number) =>
                                getGameGenreByIdIGDB(id)
                            ) || []),
                            ...(item.game_modes?.map((id: number) =>
                                getGameGameModeByIdIGDB(id)
                            ) || []),
                            ...(item.player_perspectives?.map((id: number) =>
                                getGamePerspectiveByIdIGDB(id)
                            ) || []),
                            ...(item.themes?.map((id: number) =>
                                getGameThemeByIdIGDB(id)
                            ) || []),
                        ],
                    })) || [];
                return NextResponse.json(formattedResultGames);

            default:
                return validationError(`Invalid media type: ${mediatype}`);
        }
    } catch (error) {
        console.error('[GET MEDIA ERROR] Error fetching data:', error);
        return internalServerError();
    }
}
