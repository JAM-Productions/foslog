import { MediaType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError, ValidationError } from '@/lib/errors';

interface TMDBData {
    title: string;
    poster_path: string | null;
    release_date: string | null;
    overview: string | null;
}

export async function GET(req: NextRequest) {
    try {
        const mediatype = req.nextUrl.searchParams.get('mediatype');
        const mediatitle = req.nextUrl.searchParams.get('mediatitle');

        if (!mediatype) {
            throw new ValidationError('Mediatype is required');
        }

        if (!mediatitle) {
            throw new ValidationError('Mediatitle is required');
        }

        let apiUrl = '';

        switch (mediatype) {
            case 'film':
                apiUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(mediatitle)}`;
                const res = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    },
                });

                if (!res.ok) {
                    throw new ApiError(502, 'Could not fetch data from TMDB API');
                }

                const data = await res.json();

                const formattedResult =
                    data.results?.map((item: TMDBData) => ({
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
                    })) || [];

                return NextResponse.json(formattedResult);

            default:
                throw new ValidationError(`Invalid media type: ${mediatype}`);
        }
    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            );
        }
        console.error('[GET MEDIA ERROR] Error fetching data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
