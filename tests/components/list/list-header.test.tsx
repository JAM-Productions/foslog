import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListHeader, ListHeaderProps } from '@/components/list/list-header';
import { ListType } from '@prisma/client';

// translations mock
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        if (key === 'itemsAdded' && params?.count !== undefined) {
            return `itemsAdded:${params.count}`;
        }
        if (key === 'bookmarked') return 'bookmarked';
        return key;
    },
}));
// mock next/image
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => (
        <img
            src={src}
            alt={alt}
            {...props}
        />
    ),
}));

// mock router
import { useRouter } from '@/i18n/navigation';
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
}));
const mockedUseRouter = vi.mocked(useRouter);

describe('ListHeader component', () => {
    const push = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push });
    });

    const baseProps: ListHeaderProps = {
        listName: 'My List',
        itemCount: 3,
        type: ListType.LIST,
        listUser: { id: 'user1', name: 'Alice', image: '/alice.jpg' },
    };

    it('renders name, item count and user info', () => {
        render(<ListHeader {...baseProps} />);
        expect(screen.getByText('My List')).toBeInTheDocument();
        expect(screen.getByText('itemsAdded:3')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByAltText('Alice')).toHaveAttribute(
            'src',
            '/alice.jpg'
        );
    });

    it('navigates to profile clicking avatar or name', async () => {
        render(<ListHeader {...baseProps} />);
        const avatar = screen.getByAltText('Alice');
        await userEvent.click(avatar);
        expect(push).toHaveBeenCalledWith('/profile/user1');

        const name = screen.getByText('Alice');
        await userEvent.click(name);
        expect(push).toHaveBeenCalledWith('/profile/user1');
    });

    it('shows fallback icon when user has no image', () => {
        const props = {
            ...baseProps,
            listUser: { id: 'user2', name: 'Bob' },
        };
        const { container } = render(<ListHeader {...props} />);
        expect(screen.getByText('Bob')).toBeInTheDocument();
        // fallback renders a User svg icon
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('displays bookmark layout and "bookmarked" label when type is BOOKMARK', () => {
        const props = {
            ...baseProps,
            type: ListType.BOOKMARK,
        };
        const { container } = render(<ListHeader {...props} />);
        expect(screen.getByText('bookmarked')).toBeInTheDocument();
        // check for bookmark svg icon in container
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        // container should have the green background element
        const wrapper = container.querySelector('div.bg-green-700');
        expect(wrapper).toBeInTheDocument();
    });
});
