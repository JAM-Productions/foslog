import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReviewModal from '@/components/modal/review-modal';
import { useAppStore } from '@/lib/store';

// Mock dependencies
const mockSetIsReviewModalOpen = vi.fn();
vi.mock('@/lib/store', () => ({
    useAppStore: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        if (namespace === 'ConsumedMoreThanOnce') return `Consumed ${key}`;
        if (namespace === 'CTA') return key === 'next' ? 'Next' : key;
        return key;
    },
}));

vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-body-scroll-lock', () => ({
    useBodyScrollLock: vi.fn(),
}));

// Mock child components to simplify integration test
vi.mock('@/components/modal/modal', () => ({
    default: ({ children, isModalOpen }: { children: React.ReactNode, isModalOpen: boolean }) =>
        isModalOpen ? <div data-testid="modal">{children}</div> : null,
}));

// Mock SearchInput since it has complex logic
vi.mock('@/components/input/search-input', () => ({
    SearchInput: ({ onChange, setSelectedMedia, setMediaTitle, disabled }: any) => (
        <input
            data-testid="search-input"
            disabled={disabled}
            onChange={onChange}
            // Add helper to simulate selection in test
            onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                    setSelectedMedia({
                        title: 'Test Movie',
                        year: '2023',
                        poster: '/poster.jpg',
                        type: 'film'
                    });
                    setMediaTitle('Test Movie');
                }
            }}
        />
    ),
}));

// Mock Select component
vi.mock('@/components/input/select', () => ({
    default: ({ value, onChange, options }: any) => {
        const selected = options.find((o: any) => o.value === value);
        return (
            <div data-testid="select-container">
                <button
                    data-testid="select-trigger"
                    onClick={() => {
                        // For testing purposes, we'll just simulate selecting the first available option that isn't the current one
                        // or just the target option if we pass it via some test-specific way.
                        // Actually, let's just render the options always for test simplicity or make them clickable
                    }}
                >
                    {selected ? selected.label : 'Select'}
                </button>
                <div data-testid="select-options">
                    {options.map((opt: any) => (
                        <button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    },
}));

describe('ReviewModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isReviewModalOpen: true,
            setIsReviewModalOpen: mockSetIsReviewModalOpen,
        });
    });

    it('renders modal when open', () => {
        render(<ReviewModal />);
        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('handleNext makes API call and updates state correctly', async () => {
        render(<ReviewModal />);

        // 1. Select Media Type
        fireEvent.click(screen.getByText('films')); // Click option directly in our mock

        // 2. Select Media (Trigger mock selection via SearchInput mock)
        const searchInput = screen.getByTestId('search-input');
        fireEvent.keyDown(searchInput, { key: 'Enter' });

        // 3. Mock API response for existing review (hasReviewed = true)
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ hasReviewed: true }),
        });

        // 4. Click Next
        const nextBtn = screen.getByText('Next');
        expect(nextBtn).toBeEnabled();
        fireEvent.click(nextBtn);

        // 5. Verify API Call
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/media?title=Test+Movie&type=film&year=2023'),
                expect.objectContaining({
                    method: 'GET',
                })
            );
        });

        // 6. Verify Step 2 rendered
        await waitFor(() => {
            expect(screen.getByText('yourRating')).toBeInTheDocument();
        });

        // 7. Verify Checkbox state (Should be checked and disabled)
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
        expect(checkbox).toBeDisabled();
    });

    it('handleNext sets checkbox unchecked if not reviewed', async () => {
        render(<ReviewModal />);

        // 1. Setup
        fireEvent.click(screen.getByText('films')); // Click option directly in our mock
        fireEvent.keyDown(screen.getByTestId('search-input'), { key: 'Enter' });

        // 2. Mock API (hasReviewed = false)
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ hasReviewed: false }),
        });

        // 3. Next
        fireEvent.click(screen.getByText('Next'));

        // 4. Verify Checkbox
        await waitFor(() => {
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
            expect(checkbox).not.toBeDisabled();
        });
    });

    it('uses fallback translation for checkbox label in modal', async () => {
        render(<ReviewModal />);

        // 1. Setup with "film"
        fireEvent.click(screen.getByText('films')); // Click option directly in our mock
        fireEvent.keyDown(screen.getByTestId('search-input'), { key: 'Enter' });

        // 2. Mock API
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        // 3. Next
        fireEvent.click(screen.getByText('Next'));

        // 4. Verify Label
        await waitFor(() => {
            expect(screen.getByText('Consumed film')).toBeInTheDocument();
        });
    });
});
