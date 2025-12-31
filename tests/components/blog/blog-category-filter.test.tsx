import BlogCategoryFilter from '@/components/blog/blog-category-filter';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('BlogCategoryFilter', () => {
    test('renders all category buttons', () => {
        const mockOnCategoryChange = vi.fn();

        render(
            <BlogCategoryFilter
                activeCategory="all"
                onCategoryChange={mockOnCategoryChange}
            />
        );

        expect(screen.getByText('all')).toBeInTheDocument();
        expect(screen.getByText('releases')).toBeInTheDocument();
        expect(screen.getByText('films')).toBeInTheDocument();
        expect(screen.getByText('series')).toBeInTheDocument();
        expect(screen.getByText('games')).toBeInTheDocument();
        expect(screen.getByText('books')).toBeInTheDocument();
        expect(screen.getByText('music')).toBeInTheDocument();
    });

    test('highlights active category', () => {
        const mockOnCategoryChange = vi.fn();

        render(
            <BlogCategoryFilter
                activeCategory="films"
                onCategoryChange={mockOnCategoryChange}
            />
        );

        const filmsButton = screen.getByText('films').closest('button');
        const allButton = screen.getByText('all').closest('button');

        expect(filmsButton).toHaveClass('bg-primary');
        expect(allButton).toHaveClass('bg-muted');
    });

    test('calls onCategoryChange when category is clicked', async () => {
        const user = userEvent.setup();
        const mockOnCategoryChange = vi.fn();

        render(
            <BlogCategoryFilter
                activeCategory="all"
                onCategoryChange={mockOnCategoryChange}
            />
        );

        const releasesButton = screen.getByText('releases');
        await user.click(releasesButton);

        expect(mockOnCategoryChange).toHaveBeenCalledWith('releases');
    });

    test('all buttons have type="button"', () => {
        const mockOnCategoryChange = vi.fn();

        render(
            <BlogCategoryFilter
                activeCategory="all"
                onCategoryChange={mockOnCategoryChange}
            />
        );

        const buttons = screen.getAllByRole('button');

        buttons.forEach((button) => {
            expect(button).toHaveAttribute('type', 'button');
        });
    });
});
