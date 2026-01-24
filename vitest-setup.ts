import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Axiom modules to avoid import issues with next/server
vi.mock('@/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
    withAxiom: vi.fn((handler: any) => handler),
}));

vi.mock('@axiomhq/nextjs', () => ({
    createAxiomRouteHandler: vi.fn((logger: any) => (handler: any) => handler),
    nextJsFormatters: {},
}));
