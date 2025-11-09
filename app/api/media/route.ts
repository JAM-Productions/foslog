import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
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
                { error: 'You have already added this media item' },
                { status: 409 }
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
