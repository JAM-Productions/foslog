import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ListMediaContent } from '@/components/list/list-media-content';
import { MediaType } from '@/lib/store';

// mock translations
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        if (key === 'deleteMediaFromListTitle' && params?.title) {
            return `delete title:${params.title}`;
        }
        if (key === 'deleteMediaFromListDescription') return 'delete desc';
        if (key === 'delete') return 'delete';
        if (key === 'mediaRemovedFromList') return 'removed';
        if (key === 'mediaRemoveFromListFailed') return 'failed';
        return key;
    },
}));

// mock router
import { useRouter } from '@/i18n/navigation';
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
}));
const mockedUseRouter = vi.mocked(useRouter);

// mock auth
import { useAuth } from '@/lib/auth/auth-provider';
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));
const mockedUseAuth = vi.mocked(useAuth);

// mock stores
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { useToastStore } from '@/lib/toast-store';
vi.mock('@/lib/options-modal-store', () => ({
    useOptionsModalStore: vi.fn(),
}));
vi.mock('@/lib/toast-store', () => ({
    useToastStore: vi.fn(),
}));
const mockedOptions = vi.mocked(useOptionsModalStore);
const mockedToast = vi.mocked(useToastStore);

// mock child components
import { ListColFormat } from '@/components/list/list-col-format';
import { ListTableFormat } from '@/components/list/list-table-format';
vi.mock('@/components/list/list-col-format', () => ({
    ListColFormat: vi.fn(() => <div data-testid="col-format" />),
}));
vi.mock('@/components/list/list-table-format', () => ({
    ListTableFormat: vi.fn(() => <div data-testid="table-format" />),
}));

// provide global fetch stub
const originalFetch = global.fetch;

describe('ListMediaContent', () => {
    const push = vi.fn();
    const refresh = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push, refresh });
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
        mockedOptions.mockReturnValue({
            showModal: vi.fn(),
            setIsCTALoading: vi.fn(),
            hideModal: vi.fn(),
        } as any);
        mockedToast.mockReturnValue({ showToast: vi.fn() } as any);
        global.fetch = vi.fn();
    });
    afterEach(() => {
        global.fetch = originalFetch;
    });

    const items = [
        {
            id: 'i1',
            mediaId: 'm1',
            createdAt: new Date(),
            media: { id: 'm1', title: 'Movie', type: 'film' as MediaType },
        },
    ];
    const listUser = { id: 'user1', name: 'Alice' };

    it('passes correct props to children and determines ownership', () => {
        render(
            <ListMediaContent
                listId="list"
                mediaItems={items}
                listUser={listUser}
            />
        );
        expect(screen.getByTestId('col-format')).toBeInTheDocument();
        expect(screen.getByTestId('table-format')).toBeInTheDocument();
        // verify the mocks were called with props
        const colArgs = (ListColFormat as any).mock.calls[0][0];
        expect(colArgs.mediaItems).toBe(items);
        expect(colArgs.isOwner).toBe(true);
        expect(typeof colArgs.openDeleteModal).toBe('function');
    });

    it('openDeleteModal triggers modal callback which removes media on success', async () => {
        const showModal = vi.fn();
        const setIsCTALoading = vi.fn();
        const hideModal = vi.fn();
        const showToast = vi.fn();
        mockedOptions.mockReturnValue({
            showModal,
            setIsCTALoading,
            hideModal,
        } as any);
        mockedToast.mockReturnValue({ showToast } as any);

        render(
            <ListMediaContent
                listId="list"
                mediaItems={items}
                listUser={listUser}
            />
        );
        const colArgs = (ListColFormat as any).mock.calls[0][0];
        // call openDeleteModal
        colArgs.openDeleteModal('m1', 'Movie');
        // showModal should be called with translated title/desc
        expect(showModal).toHaveBeenCalled();
        const modalArgs = showModal.mock.calls[0];
        const callback = modalArgs[3];

        // simulate successful delete
        (global.fetch as vi.Mock).mockResolvedValue({ ok: true });
        await callback();
        expect(setIsCTALoading).toHaveBeenCalledWith(true);
        expect(refresh).toHaveBeenCalled();
        expect(showToast).toHaveBeenCalledWith('removed', 'success');
        expect(hideModal).toHaveBeenCalled();

        // simulate failure
        (global.fetch as vi.Mock).mockResolvedValue({ ok: false });
        await callback();
        expect(showToast).toHaveBeenCalledWith('failed', 'error');
    });
});
