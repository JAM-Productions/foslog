import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = await prisma.user.create({
            data: {
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
            },
        });

        const media = await prisma.mediaItem.create({
            data: {
                id: 'media-1',
                title: 'Test Media',
                type: 'film',
                releaseDate: new Date(),
                averageRating: 0,
                totalReviews: 1,
                totalLikes: 0,
                totalDislikes: 0,
                genres: {
                    connectOrCreate: {
                        where: {
                            tmdbId: 28,
                        },
                        create: {
                            tmdbId: 28,
                            name: 'Action',
                        },
                    },
                },
            },
        });

        await prisma.review.create({
            data: {
                id: 'review-1',
                rating: 5,
                review: 'This is a test review.',
                userId: user.id,
                mediaId: media.id,
            },
        });

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json(
            { error: 'Failed to seed database' },
            { status: 500 }
        );
    }
}
