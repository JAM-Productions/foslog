import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListTableFormat } from '@/components/list/list-table-format';
import { MediaType } from '@/lib/store';

// mock translations
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        if (key === 'unknown') return 'unknown';
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

// the sort buttons drive the URL through next/navigation
const sortPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: sortPush }),
    usePathname: () => '/en/profile/user1/list/list1',
}));

describe('ListTableFormat component', () => {
    const push = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push });
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
    });

    const baseItems = [
        {
            id: 'i1',
            mediaId: 'm1',
            createdAt: new Date('2025-01-15'),
            media: {
                id: 'm1',
                title: 'Film One',
                type: 'film' as MediaType,
                year: 2020,
                poster: '/poster.jpg',
            },
        },
        {
            id: 'i2',
            mediaId: 'm2',
            createdAt: new Date('2025-02-10'),
            media: {
                id: 'm2',
                title: 'Series Two',
                type: 'series' as MediaType,
                year: 2021,
            },
        },
    ];

    it('renders table headers with correct labels', () => {
        render(
            <ListTableFormat
                mediaItems={baseItems}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.getByText('yearReleased')).toBeInTheDocument();
        expect(screen.getByText('type')).toBeInTheDocument();
        expect(screen.getByText('dateAdded')).toBeInTheDocument();
    });

    it('does not show delete column header when not owner', () => {
        const { container } = render(
            <ListTableFormat
                mediaItems={baseItems}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        const headers = container.querySelectorAll('th');
        expect(headers.length).toBe(4); // name, year, type, dateAdded
    });

    it('shows delete column header when owner', () => {
        const { container } = render(
            <ListTableFormat
                mediaItems={baseItems}
                isOwner={true}
                openDeleteModal={vi.fn()}
            />
        );
        const headers = container.querySelectorAll('th');
        expect(headers.length).toBe(5); // name, year, type, dateAdded, delete
    });

    it('renders media items with all details', () => {
        render(
            <ListTableFormat
                mediaItems={baseItems}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        expect(screen.getByText('Film One')).toBeInTheDocument();
        expect(screen.getByText('Series Two')).toBeInTheDocument();
        expect(screen.getByText('2020')).toBeInTheDocument();
        expect(screen.getByText('2021')).toBeInTheDocument();
        expect(screen.getByText('film')).toBeInTheDocument();
        expect(screen.getByText('series')).toBeInTheDocument();
    });

    it('navigates when title or poster clicked', async () => {
        render(
            <ListTableFormat
                mediaItems={baseItems}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        const title = screen.getByText('Film One');
        await userEvent.click(title);
        expect(push).toHaveBeenCalledWith('/media/m1');

        push.mockClear();
        const poster = screen.getByAltText('Film One');
        await userEvent.click(poster);
        expect(push).toHaveBeenCalledWith('/media/m1');
    });

    it('shows fallback initial and unknown year when missing', () => {
        const itemsNoPoster = [
            {
                id: 'i3',
                mediaId: 'm3',
                createdAt: new Date(),
                media: {
                    id: 'm3',
                    title: 'Mystery',
                    type: 'film' as MediaType,
                },
            },
        ];
        render(
            <ListTableFormat
                mediaItems={itemsNoPoster}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        expect(screen.getByText('M')).toBeInTheDocument(); // initial
        expect(screen.getByText('unknown')).toBeInTheDocument(); // year
    });

    it('renders delete button when owner', async () => {
        const openModal = vi.fn();
        render(
            <ListTableFormat
                mediaItems={baseItems}
                isOwner={true}
                openDeleteModal={openModal}
            />
        );
        const deleteButtons = screen.getAllByRole('button');
        // filter for the Trash2 buttons (find the ones at the end)
        const trashButton = deleteButtons[deleteButtons.length - 1];
        await userEvent.click(trashButton);
        expect(openModal).toHaveBeenCalledWith('m2', 'Series Two');
    });

    it('does not render delete button when not owner', () => {
        const { container } = render(
            <ListTableFormat
                mediaItems={baseItems}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        const rows = container.querySelectorAll('tbody tr');
        // each row should have 4 cells (no delete column)
        rows.forEach((row) => {
            expect(row.querySelectorAll('td').length).toBe(4);
        });
    });

    it('shows empty message and button when no items and owner', () => {
        render(
            <ListTableFormat
                mediaItems={[]}
                isOwner={true}
                openDeleteModal={vi.fn()}
            />
        );
        expect(screen.getByText('emptyList')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'searchMedia' })
        ).toBeInTheDocument();
    });

    it('shows empty message without button when no items and not owner', () => {
        render(
            <ListTableFormat
                mediaItems={[]}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        expect(screen.getByText('emptyList')).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'searchMedia' })
        ).toBeNull();
    });

    it('formats dates correctly in table', () => {
        render(
            <ListTableFormat
                mediaItems={baseItems}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        // Date formatting is locale-dependent, just verify the dates are rendered
        const dateStr = new Date('2025-01-15').toLocaleDateString();
        expect(screen.getByText(dateStr)).toBeInTheDocument();
    });

    describe('column sorting', () => {
        const renderWithSort = (sort?: string) =>
            render(
                <ListTableFormat
                    mediaItems={baseItems}
                    isOwner={false}
                    openDeleteModal={vi.fn()}
                    sort={sort}
                />
            );

        const yearButton = () => screen.getByTestId('sort-year-released');
        const addedButton = () => screen.getByTestId('sort-date-added');

        it('renders a sort control next to both date columns', () => {
            renderWithSort();

            expect(yearButton()).toBeInTheDocument();
            expect(addedButton()).toBeInTheDocument();
        });

        it('starts with the release date unsorted and date added descending', () => {
            renderWithSort();

            expect(yearButton()).toHaveAttribute('data-direction', 'none');
            expect(addedButton()).toHaveAttribute('data-direction', 'desc');
        });

        it('cycles the release date from default to newest first', async () => {
            const user = userEvent.setup();
            renderWithSort();

            await user.click(yearButton());

            expect(sortPush).toHaveBeenCalledWith(
                '/en/profile/user1/list/list1?sort=year-desc'
            );
        });

        it('cycles the release date from newest to oldest first', async () => {
            const user = userEvent.setup();
            renderWithSort('year-desc');

            expect(yearButton()).toHaveAttribute('data-direction', 'desc');
            await user.click(yearButton());

            expect(sortPush).toHaveBeenCalledWith(
                '/en/profile/user1/list/list1?sort=year-asc'
            );
        });

        it('cycles the release date back to the default order', async () => {
            const user = userEvent.setup();
            renderWithSort('year-asc');

            expect(yearButton()).toHaveAttribute('data-direction', 'asc');
            await user.click(yearButton());

            expect(sortPush).toHaveBeenCalledWith(
                '/en/profile/user1/list/list1'
            );
        });

        it('toggles date added to oldest first and back', async () => {
            const user = userEvent.setup();
            const { unmount } = renderWithSort();

            await user.click(addedButton());
            expect(sortPush).toHaveBeenCalledWith(
                '/en/profile/user1/list/list1?sort=added-asc'
            );
            unmount();

            renderWithSort('added-asc');
            expect(addedButton()).toHaveAttribute('data-direction', 'asc');

            await user.click(addedButton());
            expect(sortPush).toHaveBeenCalledWith(
                '/en/profile/user1/list/list1'
            );
        });

        it('shows date added as inactive while the release date drives the order', () => {
            renderWithSort('year-desc');

            expect(addedButton()).toHaveAttribute('data-direction', 'none');
        });

        it('shows the release date as inactive while date added drives the order', () => {
            renderWithSort('added-asc');

            expect(yearButton()).toHaveAttribute('data-direction', 'none');
        });

        it('hides the sort controls when the list itself is empty', () => {
            render(
                <ListTableFormat
                    mediaItems={[]}
                    isOwner={false}
                    openDeleteModal={vi.fn()}
                    hasItems={false}
                />
            );

            expect(
                screen.queryByTestId('sort-year-released')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('sort-date-added')
            ).not.toBeInTheDocument();
        });

        it('keeps the sort controls when a search returns nothing', () => {
            render(
                <ListTableFormat
                    mediaItems={[]}
                    isOwner={false}
                    openDeleteModal={vi.fn()}
                    isFiltered
                    hasItems
                />
            );

            expect(
                screen.getByTestId('sort-year-released')
            ).toBeInTheDocument();
        });
    });
});
