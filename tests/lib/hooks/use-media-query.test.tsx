import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock window.matchMedia
const createMatchMediaMock = (matches: boolean) => {
    const listeners: ((event: { matches: boolean }) => void)[] = [];
    return {
        matches,
        media: '',
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn((event, listener) => {
            if (event === 'change') {
                listeners.push(listener);
            }
        }),
        removeEventListener: vi.fn((event, listener) => {
            if (event === 'change') {
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }),
        dispatchEvent: vi.fn((event) => {
            if (event.type === 'change') {
                listeners.forEach((listener) => listener({ matches }));
            }
        }),
        __simulateChange: (newMatches: boolean) => {
            listeners.forEach((listener) => listener({ matches: newMatches }));
        },
    };
};

describe('useMediaQuery', () => {
    let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should return false when the media query does not match', () => {
        matchMediaMock = createMatchMediaMock(false);
        vi.stubGlobal('matchMedia', () => matchMediaMock);

        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
        expect(result.current).toBe(false);
    });

    it('should return true when the media query matches', () => {
        matchMediaMock = createMatchMediaMock(true);
        vi.stubGlobal('matchMedia', () => matchMediaMock);

        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
        expect(result.current).toBe(true);
    });

    it('should update when the media query changes', () => {
        matchMediaMock = createMatchMediaMock(false);
        vi.stubGlobal('matchMedia', () => matchMediaMock);

        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
        expect(result.current).toBe(false);

        act(() => {
            matchMediaMock.__simulateChange(true);
        });

        expect(result.current).toBe(true);
    });
});
