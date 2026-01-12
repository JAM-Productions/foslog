import { NextRequest, NextResponse } from 'next/server';
import { badGateway, internalServerError, validationError } from '@/lib/errors';
import {
    parseIGDBGame,
    parseTMDBMovie,
    parseTMDBSerie,
    parseGoogleBooksVolume,
} from './utils/parsers';
import { getIgdbToken, IgdbTokenError } from './utils/get-igdb-token';

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
                const formattedResult = data.results?.map(parseTMDBMovie) || [];
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
                    dataSeries.results?.map(parseTMDBSerie) || [];
                return NextResponse.json(formattedResultSeries);

            case 'game':
                let accessToken: string;
                try {
                    accessToken = await getIgdbToken();
                } catch (error) {
                    if (error instanceof IgdbTokenError) {
                        return badGateway(error.message);
                    }
                    console.error(
                        '[GET MEDIA ERROR] Unexpected error obtaining IGDB token:',
                        error
                    );
                    return badGateway(
                        'Could not obtain access token from IGDB'
                    );
                }
                apiUrl = 'https://api.igdb.com/v4/games';
                const escapedTitle = mediatitle
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"');
                const apicalypseQuery = `search "${escapedTitle}"; fields id,name,cover.url,first_release_date,genres,summary,game_modes,player_perspectives,themes; limit 10;`;
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
                    dataGames?.map(parseIGDBGame) || [];
                return NextResponse.json(formattedResultGames);

            case 'book':
                const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;
                if (!googleBooksApiKey) {
                    console.error(
                        'Google Books API Error: GOOGLE_BOOKS_API_KEY environment variable is not set'
                    );
                    return badGateway('Google Books API key is not configured');
                }
                apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                    mediatitle
                )}&key=${googleBooksApiKey}&printType=books&maxResults=20`;
                const resBooks = await fetch(apiUrl);

                if (!resBooks.ok) {
                    const errorText = await resBooks.text();
                    console.error(
                        'Google Books API Error:',
                        resBooks.status,
                        errorText
                    );
                    return badGateway(
                        `Could not fetch data from Google Books API: ${resBooks.status}`
                    );
                }
                const dataBooks = await resBooks.json();
                const formattedResultBooks =
                    dataBooks.items?.map(parseGoogleBooksVolume) || [];
                return NextResponse.json(formattedResultBooks);

            default:
                return validationError(`Invalid media type: ${mediatype}`);
        }
    } catch (error) {
        console.error('[GET MEDIA ERROR] Error fetching data:', error);
        return internalServerError();
    }
}
