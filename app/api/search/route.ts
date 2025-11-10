import { MediaType } from '@prisma/client';
import { NextResponse } from 'next/server';

interface TMDBData {
    title: string;
    poster_path: string | null;
    release_date: string | null;
    overview: string | null;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mediatype = searchParams.get('mediatype');
    const mediatitle = searchParams.get('mediatitle');

    if (!mediatype) {
        console.log('[GET MEDIA] No mediatype provided');
        return NextResponse.json([]);
    }

    if (!mediatitle) {
        console.log('[GET MEDIA] No mediatitle provided');
        return NextResponse.json([]);
    }

    try {
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
                    console.error(
                        '[GET MEDIA ERROR] TMDB API error:',
                        res.status
                    );
                    return NextResponse.json([]);
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
                return NextResponse.json([]);
        }
    } catch (error) {
        console.error('[GET MEDIA ERROR] Error fetching data:', error);
        return NextResponse.json([]);
    }
}
