import {
    Book,
    Clapperboard,
    Gamepad2,
    Music,
    StickyNote,
    Tv,
} from 'lucide-react';

import type { MediaItem } from '@/lib/store';

/** Media types that have their own wording in the message files. */
const TRANSLATED_MEDIA_TYPES = ['film', 'series', 'book', 'game', 'music'];

/**
 * Message key for a media type, falling back to the generic wording for
 * anything the translations don't cover.
 */
export const getMediaTypeMessageKey = (mediaType: string): string =>
    TRANSLATED_MEDIA_TYPES.includes(mediaType.toLowerCase())
        ? mediaType.toLowerCase()
        : 'default';

export const getMediaTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
        case 'film':
            return Clapperboard;
        case 'series':
            return Tv;
        case 'game':
            return Gamepad2;
        case 'book':
            return Book;
        case 'music':
            return Music;
        default:
            return StickyNote;
    }
};
