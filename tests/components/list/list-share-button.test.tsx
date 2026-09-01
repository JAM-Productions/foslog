import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ListShareButton } from '@/components/list/list-share-button';
import { ListType } from '@prisma/client';

const mockShowToast = vi.fn();
vi.mock('@/lib/toast-store', () => ({
    useToastStore: () => ({ showToast: mockShowToast }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            shareList: 'Share',
            linkCopied: 'Link copied',
            copyFailed: 'Copy failed',
        };
        return translations[key] || key;
    },
}));

describe('ListShareButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderShare = (
        overrides: { isPublic?: boolean; type?: ListType } = {}
    ) =>
        render(
            <ListShareButton
                listId="list1"
                listName="Essential movies"
                type={overrides.type ?? ListType.LIST}
                isPublic={overrides.isPublic ?? true}
                userId="user1"
            />
        );

    it('renders for a public list', () => {
        renderShare();

        expect(screen.getByTestId('share-list-button')).toBeInTheDocument();
    });

    it('renders nothing while the list is private', () => {
        renderShare({ isPublic: false });

        expect(
            screen.queryByTestId('share-list-button')
        ).not.toBeInTheDocument();
    });

    it('renders nothing for a bookmark list', () => {
        renderShare({ type: ListType.BOOKMARK });

        expect(
            screen.queryByTestId('share-list-button')
        ).not.toBeInTheDocument();
    });

    it('copies the list link when the platform has no share sheet', async () => {
        // jsdom has no navigator.share, so this exercises the clipboard path.
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(window, 'isSecureContext', {
            value: true,
            configurable: true,
        });
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            configurable: true,
        });

        renderShare();

        fireEvent.click(screen.getByTestId('share-list-button'));

        await waitFor(() => {
            expect(writeText).toHaveBeenCalledWith(
                `${window.location.origin}/profile/user1/list/list1`
            );
        });
        expect(mockShowToast).toHaveBeenCalledWith('Link copied', 'success');
    });

    it('warns instead of copying outside a secure context', async () => {
        Object.defineProperty(window, 'isSecureContext', {
            value: false,
            configurable: true,
        });

        renderShare();

        fireEvent.click(screen.getByTestId('share-list-button'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Copy failed', 'error');
        });
    });
});
