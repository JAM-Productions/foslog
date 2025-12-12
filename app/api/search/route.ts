import { MediaType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { badGateway, internalServerError, validationError } from '@/lib/errors';
import {
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

            default:
                return validationError(`Invalid media type: ${mediatype}`);
        }
    } catch (error) {
        console.error('[GET MEDIA ERROR] Error fetching data:', error);
        return internalServerError();
    }
}
