import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListSortButton } from '@/components/list/list-sort-button';

const push = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
    usePathname: () => '/en/profile/user1/list/list1',
}));

const setSearch = (search: string) => {
    Object.defineProperty(window, 'location', {
        value: { search },
        writable: true,
    });
};

describe('ListSortButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setSearch('');
    });

    const renderButton = (
        direction: 'none' | 'asc' | 'desc',
        nextSort: string | null
    ) =>
        render(
            <ListSortButton
                direction={direction}
                nextSort={nextSort}
                label="Sort by release date"
                testId="sort-year-released"
            />
        );

    it('exposes the current direction', () => {
        renderButton('desc', 'year-asc');

        expect(screen.getByTestId('sort-year-released')).toHaveAttribute(
            'data-direction',
            'desc'
        );
    });

    it('is muted when the column is not sorting', () => {
        renderButton('none', 'year-desc');

        expect(screen.getByTestId('sort-year-released').className).toContain(
            'text-muted-foreground'
        );
    });

    it('is highlighted while the column drives the order', () => {
        renderButton('asc', null);

        expect(screen.getByTestId('sort-year-released').className).toContain(
            'text-primary'
        );
    });

    it('applies the next sort value', async () => {
        const user = userEvent.setup();
        renderButton('none', 'year-desc');

        await user.click(screen.getByTestId('sort-year-released'));

        expect(push).toHaveBeenCalledWith(
            '/en/profile/user1/list/list1?sort=year-desc'
        );
    });

    it('clears the sort param when the next value is null', async () => {
        setSearch('?sort=year-asc');
        const user = userEvent.setup();
        renderButton('asc', null);

        await user.click(screen.getByTestId('sort-year-released'));

        expect(push).toHaveBeenCalledWith('/en/profile/user1/list/list1');
    });

    it('keeps other params and resets the page', async () => {
        setSearch('?search=matrix&page=4');
        const user = userEvent.setup();
        renderButton('none', 'year-desc');

        await user.click(screen.getByTestId('sort-year-released'));

        expect(push).toHaveBeenCalledWith(
            '/en/profile/user1/list/list1?search=matrix&sort=year-desc'
        );
    });
});
