import { NextRequest, NextResponse } from 'next/server';
import {
    badGateway,
    internalServerError,
    validationError,
    IgdbTokenError,
} from '@/lib/errors';
import {
    parseIGDBGame,
    parseTMDBMovie,
    parseTMDBSerie,
    parseGoogleBooksVolume,
} from './utils/parsers';
import { getIgdbToken } from './utils/get-igdb-token';
import { withAxiom, logger } from '@/lib/axiom/server';

export const GET = withAxiom(async (req: NextRequest) => {
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
                logger.info('GET /api/search', {
                    mediatype,
                    mediatitle,
                    results: formattedResult.length,
                });
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
                logger.info('GET /api/search', {
                    mediatype,
                    mediatitle,
                    results: formattedResultSeries.length,
                });
                return NextResponse.json(formattedResultSeries);

            case 'game':
                let accessToken: string;
                try {
                    accessToken = await getIgdbToken();
                } catch (error) {
                    if (error instanceof IgdbTokenError) {
                        return badGateway(error.message);
                    }
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
                logger.info('GET /api/search', {
                    mediatype,
                    mediatitle,
                    results: formattedResultGames.length,
                });
                return NextResponse.json(formattedResultGames);

            case 'book':
                const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;
                if (!googleBooksApiKey) {
                    return badGateway('Google Books API key is not configured');
                }
                apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                    mediatitle
                )}&key=${googleBooksApiKey}&printType=books&maxResults=20&langRestrict=en`;
                const resBooks = await fetch(apiUrl);

                if (!resBooks.ok) {
                    const errorText = await resBooks.text();
                    return badGateway(
                        `Could not fetch data from Google Books API. Status: ${resBooks.status}, Error: ${errorText || 'No error details'}`
                    );
                }
                const dataBooks = await resBooks.json();
                const formattedResultBooks =
                    dataBooks.items
                        ?.filter(
                            (book: { volumeInfo: { language?: string } }) =>
                                book.volumeInfo.language === 'en' ||
                                book.volumeInfo.language === 'es' ||
                                book.volumeInfo.language === 'ca'
                        )
                        .map(parseGoogleBooksVolume) || [];
                logger.info('GET /api/search', {
                    mediatype,
                    mediatitle,
                    results: formattedResultBooks.length,
                });
                return NextResponse.json(formattedResultBooks);

            default:
                return validationError(`Invalid media type: ${mediatype}`);
        }
    } catch (error) {
        logger.error('GET /api/search', { error });
        return internalServerError();
    }
});
