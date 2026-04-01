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
import { parseDateOnlyUTC } from '@/lib/date';

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

        const {
            Name,
            Year,
            Rating,
            Rewatch,
            Review: ReviewText,
            'Watched Date': WatchedDateRaw,
            Date: PublishDateRaw,
        } = body;

        if (!Name || !Year) {
            return validationError(
                'Name and Year are required to import a review from Letterboxd.'
            );
        }

        const parsedYear = parseInt(Year, 10);
        if (isNaN(parsedYear)) {
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

        // Determine consumed date: parse YYYY-MM-DD as noon UTC to avoid day-shift
        let consumedDate: Date | undefined = undefined;
        if (WatchedDateRaw) {
            const parsed = parseDateOnlyUTC(WatchedDateRaw);
            if (parsed) consumedDate = parsed;
        } else if (PublishDateRaw) {
            const parsed = parseDateOnlyUTC(PublishDateRaw);
            if (parsed) consumedDate = parsed;
        }

        if (existingReview) {
            // If it exists, update it if it's a rewatch or if the existing one has less info
            await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    consumedMoreThanOnce:
                        existingReview.consumedMoreThanOnce || isRewatch,
                    ...(consumedDate &&
                        !(existingReview.consumedDate as any) && {
                            consumedDate,
                        }),
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
                consumedDate: consumedDate,
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
