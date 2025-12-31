import BlogListClient from '@/components/blog/blog-list-client';
import { BlogPostMetadata } from '@/utils/blog-utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            title: 'Blog',
            noPosts: 'No posts available',
        };
        return translations[key] || key;
    },
}));

// Mock BlogCard component
vi.mock('@/components/blog/blog-card', () => ({
    default: ({
        title,
        slug,
    }: {
        title: string;
        slug: string;
    }) => (
        <div data-testid={`blog-card-${slug}`}>
            <h2>{title}</h2>
        </div>
    ),
}));

// Mock BlogCategoryFilter component
vi.mock('@/components/blog/blog-category-filter', () => ({
    default: ({
        activeCategory,
        onCategoryChange,
    }: {
        activeCategory: string;
        onCategoryChange: (category: string) => void;
    }) => (
        <div data-testid="category-filter">
            <button onClick={() => onCategoryChange('all')}>All</button>
            <button onClick={() => onCategoryChange('releases')}>
                Releases
            </button>
            <button onClick={() => onCategoryChange('films')}>Films</button>
            <span data-testid="active-category">{activeCategory}</span>
        </div>
    ),
}));

describe('BlogListClient', () => {
    const mockPosts: BlogPostMetadata[] = [
        {
            slug: 'releases/post-1',
            title: 'Release Post 1',
            date: '2025-12-31',
            category: 'releases',
            description: 'Release description',
        },
        {
            slug: 'films/post-2',
            title: 'Film Post 2',
            date: '2025-12-30',
            category: 'films',
            description: 'Film description',
        },
        {
            slug: 'releases/post-3',
            title: 'Release Post 3',
            date: '2025-12-29',
            category: 'releases',
            description: 'Another release',
        },
    ];

    test('renders all posts by default', () => {
        render(
            <BlogListClient
                posts={mockPosts}
                locale="en"
            />
        );

        expect(screen.getByText('Blog')).toBeInTheDocument();
        expect(screen.getByText('Release Post 1')).toBeInTheDocument();
        expect(screen.getByText('Film Post 2')).toBeInTheDocument();
        expect(screen.getByText('Release Post 3')).toBeInTheDocument();
    });

    test('filters posts by category', async () => {
        const user = userEvent.setup();

        render(
            <BlogListClient
                posts={mockPosts}
                locale="en"
            />
        );

        const releasesButton = screen.getByText('Releases');
        await user.click(releasesButton);

        expect(screen.getByText('Release Post 1')).toBeInTheDocument();
        expect(screen.queryByText('Film Post 2')).not.toBeInTheDocument();
        expect(screen.getByText('Release Post 3')).toBeInTheDocument();
    });

    test('shows all posts when "All" category is selected', async () => {
        const user = userEvent.setup();

        render(
            <BlogListClient
                posts={mockPosts}
                locale="en"
            />
        );

        // First filter by releases
        const releasesButton = screen.getByText('Releases');
        await user.click(releasesButton);

        // Then click All
        const allButton = screen.getByText('All');
        await user.click(allButton);

        expect(screen.getByText('Release Post 1')).toBeInTheDocument();
        expect(screen.getByText('Film Post 2')).toBeInTheDocument();
        expect(screen.getByText('Release Post 3')).toBeInTheDocument();
    });

    test('displays no posts message when filtered list is empty', async () => {
        const user = userEvent.setup();

        const postsWithoutFilms = mockPosts.filter(
            (p) => p.category !== 'films'
        );

        render(
            <BlogListClient
                posts={postsWithoutFilms}
                locale="en"
            />
        );

        const filmsButton = screen.getByText('Films');
        await user.click(filmsButton);

        expect(screen.getByText('No posts available')).toBeInTheDocument();
        expect(screen.queryByText('Release Post 1')).not.toBeInTheDocument();
    });

    test('displays no posts message when posts array is empty', () => {
        render(
            <BlogListClient
                posts={[]}
                locale="en"
            />
        );

        expect(screen.getByText('No posts available')).toBeInTheDocument();
    });

    test('renders category filter component', () => {
        render(
            <BlogListClient
                posts={mockPosts}
                locale="en"
            />
        );

        expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });

    test('updates active category correctly', async () => {
        const user = userEvent.setup();

        render(
            <BlogListClient
                posts={mockPosts}
                locale="en"
            />
        );

        const activeCategory = screen.getByTestId('active-category');
        expect(activeCategory).toHaveTextContent('all');

        const filmsButton = screen.getByText('Films');
        await user.click(filmsButton);

        expect(activeCategory).toHaveTextContent('films');
    });
});
