import { MediaType } from '@prisma/client';
import { NextResponse } from 'next/server';

interface TMDBData {
    title: string;
    poster_path: string;
    release_date: string;
    overview: string;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mediatype = searchParams.get('mediatype');
    const mediatitle = searchParams.get('mediatitle');

    if (!mediatype) {
        console.error('Missing mediatype parameter');
        return NextResponse.json([]);
    }

    if (!mediatitle) {
        console.error('Missing mediatitle parameter');
        return NextResponse.json([]);
    }

    try {
        let apiUrl = '';

        switch (mediatype) {
            case 'film':
                apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(mediatitle)}`;
                const res = await fetch(apiUrl);

                const data = await res.json();

                const formattedResult =
                    data.results?.map((item: TMDBData) => ({
                        title: item.title,
                        type: MediaType.FILM,
                        year: parseInt(item.release_date.split('-')[0]),
                        poster:
                            'https://image.tmdb.org/t/p/w500' +
                            item.poster_path,
                        description: item.overview,
                    })) || [];
                return NextResponse.json(formattedResult);

            default:
                return NextResponse.json([]);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json([]);
    }
}
