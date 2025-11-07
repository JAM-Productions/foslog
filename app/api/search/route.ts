import { NextResponse } from 'next/server';

interface OMDBData {
    Title: string;
    Poster: string;
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
                apiUrl = `http://www.omdbapi.com/?type=movie&s=${encodeURIComponent(mediatitle)}&apikey=${process.env.OMDB_API_KEY}`;
                const res = await fetch(apiUrl);

                if (!res.ok) {
                    console.error(
                        `OMDB API error: ${res.status} ${res.statusText}`
                    );
                    return NextResponse.json([]);
                }

                const data = await res.json();

                if (data.Error) {
                    console.error('OMDB API returned error:', data.Error);
                    return NextResponse.json([]);
                }

                const formattedResult =
                    data.Search?.map((item: OMDBData) => ({
                        title: item.Title,
                        image: item.Poster,
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
