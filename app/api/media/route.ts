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

        let mediaItem;

        if (existingMedia) {
            mediaItem = existingMedia;
            console.log('Media already exists in database:', mediaItem);
        } else {
            mediaItem = await prisma.mediaItem.create({
                data: {
                    title: selectedMedia.title,
                    type: selectedMedia.type,
                    year: selectedMedia.year,
                    poster: selectedMedia.poster,
                    description: selectedMedia.description,
                },
            });
            console.log('Created new media item:', mediaItem);
        }

        return NextResponse.json(
            {
                message: existingMedia
                    ? 'Media already exists'
                    : 'Media created successfully',
                media: mediaItem,
            },
            { status: existingMedia ? 200 : 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/media:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
