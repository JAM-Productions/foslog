import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListColFormat } from '@/components/list/list-col-format';

// mock translations to return key string
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// mock router from i18n/navigation
import { useRouter } from '@/i18n/navigation';
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
}));

const mockedUseRouter = vi.mocked(useRouter);

describe('ListColFormat component', () => {
    const mockPush = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push: mockPush });
    });

    const baseItems = [
        {
            id: '1',
            mediaId: 'm1',
            createdAt: new Date('2025-01-01'),
            media: {
                id: 'm1',
                title: 'Movie One',
                type: 'film' as const,
                year: 2020,
                poster: '/poster1.jpg',
            },
        },
    ];

    it('renders empty message and button when no items and owner', () => {
        render(
            <ListColFormat
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

    it('renders empty message without button when not owner', () => {
        render(
            <ListColFormat
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

    it('displays media items with poster and details', async () => {
        render(
            <ListColFormat
                mediaItems={baseItems}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );

        expect(screen.getByText('Movie One')).toBeInTheDocument();
        // type localized key should show same string
        expect(screen.getByText('film')).toBeInTheDocument();
        expect(screen.getByText('2020')).toBeInTheDocument();
        expect(screen.getByText('addedDate')).toBeInTheDocument();
        // poster img should render
        expect(screen.getByRole('img', { name: 'Movie One' })).toHaveAttribute(
            'src',
            '/poster1.jpg'
        );
    });

    it('shows fallback initial when no poster', () => {
        const items = [
            {
                id: '2',
                mediaId: 'm2',
                createdAt: new Date(),
                media: {
                    id: 'm2',
                    title: 'Second',
                    type: 'film' as const,
                },
            },
        ];

        render(
            <ListColFormat
                mediaItems={items}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );
        expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('navigates to media page when item clicked', async () => {
        render(
            <ListColFormat
                mediaItems={baseItems}
                isOwner={false}
                openDeleteModal={vi.fn()}
            />
        );

        const card = screen.getByText('Movie One').closest('div');
        expect(card).toBeTruthy();
        await userEvent.click(card!);
        expect(mockPush).toHaveBeenCalledWith('/media/m1');
    });

    it('calls openDeleteModal and prevents navigation when trash clicked', async () => {
        const openModal = vi.fn();
        render(
            <ListColFormat
                mediaItems={baseItems}
                isOwner={true}
                openDeleteModal={openModal}
            />
        );

        const trashButton = screen.getByRole('button');
        await userEvent.click(trashButton);

        expect(openModal).toHaveBeenCalledWith('m1', 'Movie One');
        expect(mockPush).not.toHaveBeenCalled();
    });
});
