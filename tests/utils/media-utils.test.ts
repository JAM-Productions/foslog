import { describe, it, expect } from 'vitest';
import { getBookGenreByIdGoogle } from '@/utils/media-utils';
import enMessages from '@/messages/en.json';

describe('Media Utilities', () => {
    describe('getBookGenreByIdGoogle', () => {
        const mediaGenres = Object.keys(enMessages.MediaGenres);

        it('should map standard Google Books categories to internal genres', () => {
            const testCases: { [category: string]: string } = {
                'Science Fiction': 'sciFi',
                'Juvenile Fiction': 'kids',
                'Action & Adventure': 'action',
                'Fantasy': 'fantasy',
                'Mystery & Detective': 'mystery',
                'Horror': 'horror',
                'Thriller': 'thriller',
                'Romance': 'romance',
                'Biography & Autobiography': 'biography',
                'History': 'history',
                'Business & Economics': 'business',
                'Comics & Graphic Novels': 'comics',
                'Cooking': 'cooking',
                'Art': 'art',
                'Poetry': 'poetry',
                'Psychology': 'psychology',
                'Philosophy': 'philosophy',
                'Religion': 'religion',
                'Computers': 'technology',
                'Science': 'science',
                'Self-Help': 'selfHelp',
                'Travel': 'travel',
                'Education': 'educational',
                'Humor': 'comedy',
                'Drama': 'drama',
                'True Crime': 'crime',
                'Sports & Recreation': 'sport',
                'Music': 'music',
            };

            Object.entries(testCases).forEach(([input, expected]) => {
                const result = getBookGenreByIdGoogle(input);
                expect(result).toBe(expected);
                expect(mediaGenres).toContain(result);
            });
        });

        it('should perform case-insensitive matching', () => {
            expect(getBookGenreByIdGoogle('science fiction')).toBe('sciFi');
            expect(getBookGenreByIdGoogle('SCIENCE FICTION')).toBe('sciFi');
        });

        it('should handle partial matches', () => {
            expect(getBookGenreByIdGoogle('Science Fiction / Cyberpunk')).toBe('sciFi');
            expect(getBookGenreByIdGoogle('Juvenile Fiction / Animals')).toBe('kids');
        });

        it('should fallback to fiction/non-fiction if no specific match found', () => {
            expect(getBookGenreByIdGoogle('General Fiction')).toBe('fiction');
            expect(getBookGenreByIdGoogle('General Non-Fiction')).toBe('nonFiction');
        });

        it('should return unknown for completely unrecognized categories', () => {
            expect(getBookGenreByIdGoogle('Unrecognized Category 123')).toBe('unknown');
        });

        it('should guarantee that mapped genres exist in translation keys', () => {
            // This test iterates over a variety of potential inputs to ensure
            // we never return a key that isn't in our en.json
            const inputs = [
                'Science Fiction', 'Action', 'Unknown', 'Random',
                'Computers', 'Business', 'Juvenile', 'Erotica'
            ];

            inputs.forEach(input => {
                const result = getBookGenreByIdGoogle(input);
                if (result !== 'unknown') {
                    expect(mediaGenres).toContain(result);
                }
            });
        });
    });
});
