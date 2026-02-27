import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import ImportReviewsModal from '@/components/modal/import-reviews-modal';
import { useImportReviewsModalStore } from '@/lib/import-reviews-modal-store';
import { useTranslations } from 'next-intl';
import Papa from 'papaparse';

vi.mock('@/lib/import-reviews-modal-store', () => ({
    useImportReviewsModalStore: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush,
        refresh: mockRefresh,
    })),
}));

vi.mock('@/lib/toast-store', () => ({
    useToastStore: vi.fn(() => ({
        showToast: vi.fn(),
    })),
}));

vi.mock('@/hooks/use-body-scroll-lock', () => ({
    useBodyScrollLock: vi.fn(),
}));

vi.mock('papaparse', () => ({
    default: {
        parse: vi.fn(),
    },
}));

vi.mock('@/components/modal/modal', () => ({
    default: ({
        children,
        isModalOpen,
    }: {
        children: React.ReactNode;
        isModalOpen: boolean;
    }) => (isModalOpen ? <div data-testid="modal">{children}</div> : null),
}));

describe('ImportReviewsModal', () => {
    const mockShowModal = vi.fn();
    const mockHideModal = vi.fn();
    const mockedUseImportReviewsModalStore = vi.mocked(useImportReviewsModalStore);
    const mockedUseTranslations = vi.mocked(useTranslations);

    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            title: 'Import Reviews',
            description: 'Select platform',
            'tabs.letterboxd': 'Letterboxd',
            'tabs.steam': 'Steam',
            'tabs.goodreads': 'Goodreads',
            'letterboxd.instructionsTitle': 'Instructions',
            'letterboxd.dragAndDrop': 'Drag & Drop',
            'importProfileButton': 'Import Reviews',
            'letterboxd.importing': 'Importing...',
            'letterboxd.completed': 'Completed!',
            'comingSoon': 'Coming Soon',
        };
        return translations[key] || key;
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());

        mockedUseTranslations.mockReturnValue(mockT as unknown as ReturnType<typeof useTranslations>);

        mockedUseImportReviewsModalStore.mockReturnValue({
            isModalOpen: true,
            showModal: mockShowModal,
            hideModal: mockHideModal,
        } as unknown as ReturnType<typeof useImportReviewsModalStore>);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders modal when open', () => {
        render(<ImportReviewsModal />);
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Import Reviews' })).toBeInTheDocument();
    });

    it('displays lettersboxd tab by default', () => {
        render(<ImportReviewsModal />);
        expect(screen.getByText('Instructions')).toBeInTheDocument();
        expect(screen.getByText('Drag & Drop')).toBeInTheDocument();
    });

    it('displays coming soon for Steam and Goodreads', async () => {
        const user = userEvent.setup();
        render(<ImportReviewsModal />);

        const steamTab = screen.getByRole('button', { name: 'Steam' });
        await user.click(steamTab);

        expect(screen.getByText('Coming Soon')).toBeInTheDocument();

        const goodreadsTab = screen.getByRole('button', { name: 'Goodreads' });
        await user.click(goodreadsTab);

        expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<ImportReviewsModal />);

        const closeButton = screen.getByLabelText('Close');
        await user.click(closeButton);

        expect(mockHideModal).toHaveBeenCalled();
    });

    it('processes CSV upload successfully', async () => {
        const user = userEvent.setup();

        (Papa.parse as Mock).mockImplementation((file, config) => {
            config.complete({
                data: [
                    { Name: 'Dune', Year: '2021', Rating: '4.5' }
                ]
            });
        });

        (global.fetch as Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'Success' })
        });

        render(<ImportReviewsModal />);

        // Select file
        const file = new File(['Name,Year\nDune,2021'], 'reviews.csv', { type: 'text/csv' });
        const input = document.getElementById('csv-upload') as HTMLInputElement;
        await user.upload(input, file);

        expect(screen.getByText('reviews.csv')).toBeInTheDocument();

        // Click import
        const importBtn = screen.getByRole('button', { name: 'Import Reviews' });
        await user.click(importBtn);

        expect(Papa.parse).toHaveBeenCalled();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/reviews/import/letterboxd', expect.any(Object));
        });

        expect(screen.getByText('Completed!')).toBeInTheDocument();
        expect(mockRefresh).toHaveBeenCalled();
    });
});
