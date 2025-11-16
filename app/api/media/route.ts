import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { LOCALES } from '@/lib/constants';
import {
    internalServerError,
    unauthorized,
    validationError,
} from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to create a media.'
            );
        }

        const { selectedMedia } = await request.json();

        if (!selectedMedia) {
            return validationError('Media object is required');
        }

        if (
            !selectedMedia.title ||
            !selectedMedia.type ||
            !selectedMedia.year
        ) {
            return validationError(
                'Media object must contain title, type, and year'
            );
        }

        if (
            typeof selectedMedia.year !== 'number' ||
            selectedMedia.year < 1800 ||
            selectedMedia.year > new Date().getFullYear() + 5
        ) {
            return validationError('Invalid year');
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
                genre: selectedMedia.genre,
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}`, 'page');

        return NextResponse.json(
            {
                message: 'Media created successfully',
                media: mediaItem,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/media:', error);
        return internalServerError();
    }
}
