import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { describe, it, expect, vi } from 'vitest';

// Mock window.matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}));

vi.stubGlobal('matchMedia', matchMediaMock);

describe('useMediaQuery', () => {
    it('should return false when the media query does not match', () => {
        matchMediaMock.mockReturnValueOnce({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        const { result } = renderHook(() => useMediaQuery('(max-width: 600px)'));
        expect(result.current).toBe(false);
    });

    it('should return true when the media query matches', () => {
        matchMediaMock.mockReturnValueOnce({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        const { result } = renderHook(() => useMediaQuery('(max-width: 600px)'));
        expect(result.current).toBe(true);
    });

    it('should update the value when the media query match status changes', () => {
        const listeners: ((event: { matches: boolean }) => void)[] = [];
        const mockMediaQueryList = {
            matches: false,
            addEventListener: (
                event: string,
                listener: (event: { matches: boolean }) => void
            ) => {
                if (event === 'change') {
                    listeners.push(listener);
                }
            },
            removeEventListener: vi.fn(),
        };

        matchMediaMock.mockReturnValue(mockMediaQueryList);

        const { result } = renderHook(() => useMediaQuery('(max-width: 600px)'));
        expect(result.current).toBe(false);

        act(() => {
            listeners.forEach((listener) => listener({ matches: true }));
        });

        expect(result.current).toBe(true);
    });
});
