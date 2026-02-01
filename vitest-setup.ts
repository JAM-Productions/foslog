import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock('@/lib/redis', () => ({
    redis: {
        get: vi.fn(),
        set: vi.fn(),
        setex: vi.fn(),
        del: vi.fn(),
        incr: vi.fn(),
    },
}));

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
