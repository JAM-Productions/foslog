import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children),
}));
