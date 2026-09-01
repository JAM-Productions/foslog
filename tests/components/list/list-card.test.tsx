import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListCard } from '@/components/list/list-card';
import { SafeMediaList } from '@/lib/types';
import { ListType } from '@prisma/client';

import { useRouter } from '@/i18n/navigation';
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
}));
const mockedUseRouter = vi.mocked(useRouter);

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        const translations: Record<string, string> = {
            bookmarked: 'Bookmarked',
            itemsCount: `${params?.count ?? 0} items`,
        };
        return translations[key] || key;
    },
}));

const buildList = (overrides: Partial<SafeMediaList> = {}): SafeMediaList => ({
    id: 'list1',
    name: 'Essential movies',
    type: ListType.LIST,
    totalItems: 3,
    ...overrides,
});

describe('ListCard', () => {
    const push = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push } as any);
    });

    it('renders the list name and item count', () => {
        render(
            <ListCard
                list={buildList()}
                userId="user1"
            />
        );

        expect(screen.getByText('Essential movies')).toBeInTheDocument();
        expect(screen.getByText('3 items')).toBeInTheDocument();
    });

    it('renders the list image when present', () => {
        render(
            <ListCard
                list={buildList({ image: '/list.jpg' })}
                userId="user1"
            />
        );

        expect(screen.getByAltText('Essential movies')).toBeInTheDocument();
    });

    it('renders a placeholder when the list has no image', () => {
        render(
            <ListCard
                list={buildList()}
                userId="user1"
            />
        );

        expect(screen.queryByAltText('Essential movies')).toBeNull();
        expect(screen.getByTestId('media-list-button')).toBeInTheDocument();
    });

    it('renders the translated name for bookmark lists', () => {
        render(
            <ListCard
                list={buildList({
                    id: 'bookmark1',
                    name: 'Bookmarks',
                    type: ListType.BOOKMARK,
                })}
                userId="user1"
            />
        );

        expect(screen.getByText('Bookmarked')).toBeInTheDocument();
        expect(screen.getByTestId('bookmark-list-button')).toBeInTheDocument();
    });

    it('navigates to the list when the cover is clicked', async () => {
        const user = userEvent.setup();
        render(
            <ListCard
                list={buildList()}
                userId="user1"
            />
        );

        await user.click(screen.getByTestId('media-list-button'));

        expect(push).toHaveBeenCalledWith('/profile/user1/list/list1');
    });

    it('stretches the text target across the row on mobile', () => {
        render(
            <ListCard
                list={buildList()}
                userId="user1"
            />
        );

        // `flex-1` fills the row on mobile; `sm:flex-none` restores the fixed
        // column under the cover on desktop.
        const textTarget = screen.getByTestId('media-list-name-button');
        expect(textTarget.className).toContain('flex-1');
        expect(textTarget.className).toContain('sm:flex-none');
    });

    it('keeps the item count inside the clickable area', async () => {
        const user = userEvent.setup();
        render(
            <ListCard
                list={buildList()}
                userId="user1"
            />
        );

        await user.click(screen.getByText('3 items'));

        expect(push).toHaveBeenCalledWith('/profile/user1/list/list1');
    });

    it('navigates to the list when the name is clicked', async () => {
        const user = userEvent.setup();
        render(
            <ListCard
                list={buildList()}
                userId="user2"
            />
        );

        await user.click(screen.getByTestId('media-list-name-button'));

        expect(push).toHaveBeenCalledWith('/profile/user2/list/list1');
    });
});
