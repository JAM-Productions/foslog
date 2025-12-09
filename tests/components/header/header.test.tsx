import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '@/components/header/header';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

// Mock sub-components
vi.mock('@/components/media/media-type-filter', () => ({
    default: () => <div data-testid="media-type-filter" />,
}));
vi.mock('@/components/header/user-menu', () => ({
    default: () => <div data-testid="user-menu" />,
}));
vi.mock('@/components/header/search-bar', () => ({
    default: () => <div data-testid="search-bar" />,
}));
vi.mock('@/components/header/configuration-modal', () => ({
    ConfigurationModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean;
        onClose: () => void;
    }) =>
        isOpen ? (
            <div data-testid="configuration-modal">
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

// Mock Next.js navigation and other hooks
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({
        replace: vi.fn(),
    }),
}));

vi.mock('next-themes', () => ({
    useTheme: () => ({
        setTheme: vi.fn(),
        theme: 'light',
    }),
}));

describe('Header', () => {
    const renderComponent = () =>
        render(
            <NextIntlClientProvider
                messages={messages}
                locale="en"
            >
                <Header />
            </NextIntlClientProvider>
        );

    it('renders the header and its core elements', () => {
        renderComponent();
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByAltText('Foslog')).toBeInTheDocument();
        expect(screen.getByText('Foslog')).toBeInTheDocument();
        expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    });

    it('opens and closes the configuration modal', () => {
        renderComponent();

        // Modal should be closed initially
        expect(screen.queryByTestId('configuration-modal')).toBeNull();

        // Click the settings button to open the modal
        const settingsButton = screen.getByRole('button', {
            name: /settings/i,
        });
        fireEvent.click(settingsButton);

        // Modal should now be open
        const modal = screen.getByTestId('configuration-modal');
        expect(modal).toBeInTheDocument();

        // Click the close button inside the modal to close it
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        // Modal should be closed again
        expect(screen.queryByTestId('configuration-modal')).toBeNull();
    });

    it('does not render language and theme toggles directly', () => {
        renderComponent();
        expect(screen.queryByTestId('language-selector')).toBeNull();
        expect(screen.queryByTestId('theme-toggle')).toBeNull();
    });
});
