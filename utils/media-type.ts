import {
    Book,
    Clapperboard,
    Gamepad2,
    Music,
    StickyNote,
    Tv,
} from 'lucide-react';

import type { MediaItem } from '@/lib/store';

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
