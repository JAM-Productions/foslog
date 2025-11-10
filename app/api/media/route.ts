import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { ApiError, AuthenticationError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            throw new AuthenticationError('Unauthorized. Please log in to create a media.');
        }

        const { selectedMedia } = await request.json();

        if (!selectedMedia) {
            throw new ValidationError('Media object is required');
        }

        if (
            !selectedMedia.title ||
            !selectedMedia.type ||
            !selectedMedia.year
        ) {
            throw new ValidationError('Media object must contain title, type, and year');
        }

        if (
            typeof selectedMedia.year !== 'number' ||
            selectedMedia.year < 1800 ||
            selectedMedia.year > new Date().getFullYear() + 5
        ) {
            throw new ValidationError('Invalid year');
        }

        const existingMedia = await prisma.mediaItem.findFirst({
            where: {
                title: selectedMedia.title,
                type: selectedMedia.type,
                year: selectedMedia.year,
            },
        });

        if (existingMedia) {
            return NextResponse.json(
                {
                    message: 'Media already exists',
                    media: existingMedia,
                },
                { status: 200 }
            );
        }

        const mediaItem = await prisma.mediaItem.create({
            data: {
                title: selectedMedia.title,
                type: selectedMedia.type,
                year: selectedMedia.year,
                poster: selectedMedia.poster,
                description: selectedMedia.description,
            },
        });

        return NextResponse.json(
            {
                message: 'Media created successfully',
                media: mediaItem,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            );
        }

        console.error('Error in POST /api/media:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
