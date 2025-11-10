
import { render, screen, fireEvent, act } from '@testing-library/react';
import ReviewModal from '@/components/review-modal';
import { useAppStore } from '@/lib/store';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';
import { vi, Mock } from 'vitest';
import { create } from 'zustand';

// Mock the useAppStore hook
vi.doMock('@/lib/store', () => ({
    useAppStore: create(() => ({
        isReviewModalOpen: true,
        setIsReviewModalOpen: vi.fn(),
        selectedMedia: null,
    })),
}));

describe('ReviewModal', () => {
    let useAppStore: any;
    beforeEach(async () => {
        // Reset the mock before each test
        const store = await import('@/lib/store');
        useAppStore = store.useAppStore;
        useAppStore.setState({
            isReviewModalOpen: true,
            setIsReviewModalOpen: vi.fn(),
            selectedMedia: null,
        });
    });

    it('renders the modal when isReviewModalOpen is true', async () => {
        await act(async () => {
            render(
                <NextIntlClientProvider locale="en" messages={messages}>
                    <ReviewModal />
                </NextIntlClientProvider>
            );
        });
        await screen.findByRole('dialog');
    });

    it('does not render the modal when isReviewModalOpen is false', () => {
        useAppStore.setState({ isReviewModalOpen: false });
        const { container } = render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <ReviewModal />
            </NextIntlClientProvider>
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders two submit buttons in the second step', async () => {
        await act(async () => {
            render(
                <NextIntlClientProvider locale="en" messages={messages}>
                    <ReviewModal />
                </NextIntlClientProvider>
            );
        });

        await screen.findByRole('dialog');

        // Navigate to the second step
        fireEvent.click(screen.getByText('Select Media Type'));
        fireEvent.click(screen.getByText('Films'));
        fireEvent.change(screen.getByPlaceholderText('Enter Media Title'), {
            target: { value: 'The Matrix' },
        });

        // Manually set the selected media
        useAppStore.setState({
            selectedMedia: {
                id: 1,
                title: 'The Matrix',
                poster: '',
            },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Next' }));

        const submitButtons = await screen.findAllByRole('button', { name: 'Submit Review' });
        expect(submitButtons).toHaveLength(2);
    });
});
