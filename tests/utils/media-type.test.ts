import { describe, expect, it } from 'vitest';
import {
    Book,
    Clapperboard,
    Gamepad2,
    Music,
    StickyNote,
    Tv,
} from 'lucide-react';

import { getMediaTypeIcon } from '@/utils/media-type';

describe('media-type utils', () => {
    it('returns the matching icon for each media type', () => {
        expect(getMediaTypeIcon('film')).toBe(Clapperboard);
        expect(getMediaTypeIcon('series')).toBe(Tv);
        expect(getMediaTypeIcon('game')).toBe(Gamepad2);
        expect(getMediaTypeIcon('book')).toBe(Book);
        expect(getMediaTypeIcon('music')).toBe(Music);
    });

    it('falls back to a generic icon for unsupported types', () => {
        expect(getMediaTypeIcon('unknown' as never)).toBe(StickyNote);
    });
});
