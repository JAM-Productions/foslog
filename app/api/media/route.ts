import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to create a media.' },
                { status: 401 }
            );
        }

        const { selectedMedia } = await request.json();

        if (!selectedMedia) {
            return NextResponse.json(
                { error: 'Media object is required' },
                { status: 400 }
            );
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
        console.error('Error in POST /api/media:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
