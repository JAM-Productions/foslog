import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OtherLists } from '@/components/list/other-lists';
import { SafeMediaList } from '@/lib/types';
import { ListType } from '@prisma/client';

import { useRouter } from '@/i18n/navigation';
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
}));
const mockedUseRouter = vi.mocked(useRouter);

import { useAuth } from '@/lib/auth/auth-provider';
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));
const mockedUseAuth = vi.mocked(useAuth);

vi.mock('@/lib/create-list-modal-store', () => ({
    useCreateListModalStore: () => ({ showModal: vi.fn() }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        const translations: Record<string, string> = {
            otherLists: 'Other lists',
            noOtherLists: 'There are no other lists to show.',
            seeMore: 'See more',
            bookmarked: 'Bookmarked',
            itemsCount: `${params?.count ?? 0} items`,
        };
        return translations[key] || key;
    },
}));

const lists: SafeMediaList[] = [
    {
        id: 'list2',
        name: 'To watch',
        type: ListType.LIST,
        totalItems: 5,
    },
];

describe('OtherLists', () => {
    const push = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push } as any);
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
    });

    it('renders the section title and the lists', () => {
        render(
            <OtherLists
                lists={lists}
                total={1}
                userId="user1"
            />
        );

        expect(screen.getByText('Other lists')).toBeInTheDocument();
        expect(screen.getByText('To watch')).toBeInTheDocument();
    });

    it('renders the empty message when there are no other lists', () => {
        render(
            <OtherLists
                lists={[]}
                total={0}
                userId="user1"
            />
        );

        expect(
            screen.getByText('There are no other lists to show.')
        ).toBeInTheDocument();
    });

    it('does not render a create list button', () => {
        render(
            <OtherLists
                lists={lists}
                total={1}
                userId="user1"
            />
        );

        expect(
            screen.queryByTestId('create-list-button')
        ).not.toBeInTheDocument();
    });

    it('navigates to the lists page from the mobile see more button', async () => {
        const user = userEvent.setup();
        render(
            <OtherLists
                lists={lists}
                total={9}
                userId="user2"
            />
        );

        await user.click(screen.getByTestId('see-more-lists-button'));

        expect(push).toHaveBeenCalledWith('/profile/user2/lists');
    });

    it('navigates to the lists page from the see more card', async () => {
        const user = userEvent.setup();
        render(
            <OtherLists
                lists={lists}
                total={9}
                userId="user2"
            />
        );

        await user.click(screen.getByTestId('see-more-lists-card'));

        expect(push).toHaveBeenCalledWith('/profile/user2/lists');
    });

    it('hides see more when every list is already shown', () => {
        render(
            <OtherLists
                lists={lists}
                total={1}
                userId="user1"
            />
        );

        expect(
            screen.queryByTestId('see-more-lists-button')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('see-more-lists-card')
        ).not.toBeInTheDocument();
    });
});
