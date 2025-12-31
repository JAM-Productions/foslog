import BlogCard from '@/components/blog/blog-card';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock next/link
vi.mock('next/link', () => ({
    default: ({
        children,
        href,
        className,
    }: {
        children: React.ReactNode;
        href: string;
        className?: string;
    }) => (
        <a
            href={href}
            className={className}
        >
            {children}
        </a>
    ),
}));

describe('BlogCard', () => {
    const mockProps = {
        slug: 'releases/test-post',
        title: 'Test Blog Post',
        date: '2025-12-31',
        category: 'releases',
        description: 'This is a test blog post description',
        locale: 'en',
    };

    test('renders blog card with all information', () => {
        render(<BlogCard {...mockProps} />);

        expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        expect(screen.getByText('releases')).toBeInTheDocument();
        expect(
            screen.getByText('This is a test blog post description')
        ).toBeInTheDocument();
    });

    test('renders correct link href', () => {
        render(<BlogCard {...mockProps} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/en/blog/releases/test-post');
    });

    test('displays formatted date', () => {
        render(<BlogCard {...mockProps} />);

        const timeElement = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'time';
        });

        expect(timeElement).toBeInTheDocument();
    });

    test('renders with different locale', () => {
        render(<BlogCard {...mockProps} locale="ca" />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/ca/blog/releases/test-post');
    });

    test('renders with different category', () => {
        const filmsProps = { ...mockProps, category: 'films' };
        render(<BlogCard {...filmsProps} />);

        expect(screen.getByText('films')).toBeInTheDocument();
    });
});
