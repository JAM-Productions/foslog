import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import {
    internalServerError,
    unauthorized,
    validationError,
} from '@/lib/errors';
import { logger } from '@/lib/axiom/server';
import { parseTMDBMovie } from '@/app/api/search/utils/parsers';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to import reviews.'
            );
        }

        const body = await request.json();

        console.log('--- DB IMPORT ATTEMPT START ---');
        console.log(body);

        const { Name, Year, Rating, Rewatch, Review: ReviewText } = body;

        if (!Name || !Year) {
            console.log('FAILED: Missing Name or Year');
            return validationError(
                'Name and Year are required to import a review from Letterboxd.'
            );
        }

        const parsedYear = parseInt(Year, 10);
        if (isNaN(parsedYear)) {
            console.log('FAILED: Invalid year format', Year);
            return validationError('Invalid year format');
        }

        // 1. Find or create the MediaItem
        let mediaItem = await prisma.mediaItem.findFirst({
            where: {
                title: { equals: Name, mode: 'insensitive' },
                type: 'FILM',
                year: parsedYear,
            },
        });

        if (!mediaItem) {
            // Need to fetch from TMDB
            const apiUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(Name)}&year=${parsedYear}`;

            try {
                const res = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    const results = data.results?.map(parseTMDBMovie) || [];

                    if (results.length > 0) {
                        const topResult = results[0];

                        mediaItem = await prisma.mediaItem.create({
                            data: {
                                title: topResult.title || Name,
                                type: 'FILM',
                                year: topResult.year || parsedYear,
                                poster: topResult.poster,
                                description: topResult.description || '',
                                genre: topResult.genre || [],
                            },
                        });
                    }
                }
            } catch (err) {
                logger.error('Error fetching from TMDB during import', {
                    err,
                    Name,
                    Year,
                });
                // Fallback to basic creation without TMDB metadata
            }

            // If TMDB search failed or found nothing, create basic media
            if (!mediaItem) {
                mediaItem = await prisma.mediaItem.create({
                    data: {
                        title: Name,
                        type: 'FILM',
                        year: parsedYear,
                        description: '',
                        genre: [],
                    },
                });
            }
        }

        // 2. Check if the user already has a review for this media
        console.log(
            `Checking for existing review for user ${session.user.id} and media ${mediaItem.id}`
        );
        const existingReview = await prisma.review.findFirst({
            where: {
                mediaId: mediaItem.id,
                userId: session.user.id,
            },
        });

        const isRewatch =
            Rewatch === 'Yes' || Rewatch === 'true' || Rewatch === true;
        const parsedRating = parseFloat(Rating);
        const validRating = !isNaN(parsedRating) ? parsedRating : null;

        if (existingReview) {
            // If it exists, update it if it's a rewatch or if the existing one has less info
            console.log('Found existing review. Updating...');
            await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    consumedMoreThanOnce:
                        existingReview.consumedMoreThanOnce || isRewatch,
                    // We don't overwrite the full review automatically unless empty,
                    // but we do update the 'consumedMoreThanOnce' flag
                },
            });

            return NextResponse.json(
                {
                    message: 'Review already existed, updated rewatch status',
                    media: mediaItem,
                    alreadyExisted: true,
                },
                { status: 200 }
            );
        }

        // 3. Create the review
        const newReview = await prisma.review.create({
            data: {
                rating: validRating,
                review: ReviewText || null,
                consumedMoreThanOnce: isRewatch,
                mediaId: mediaItem.id,
                userId: session.user.id,
            },
        });

        logger.info('POST /api/reviews/import/letterboxd', {
            userId: session.user.id,
            mediaId: mediaItem.id,
            reviewId: newReview.id,
            imported: true,
        });

        console.log(`Created new review: ${newReview.id}`);

        return NextResponse.json(
            {
                message: 'Review imported successfully',
                review: newReview,
                media: mediaItem,
            },
            { status: 201 }
        );
    } catch (error) {
        logger.error('POST /api/reviews/import/letterboxd', { error });
        return internalServerError();
    }
}
