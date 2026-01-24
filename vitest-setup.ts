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
