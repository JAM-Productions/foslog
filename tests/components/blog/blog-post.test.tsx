import BlogPost from '@/components/blog/blog-post';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
    back: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: any) => key,
}));

// Mock react-markdown
vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe('BlogPost', () => {
    const mockProps = {
        title: 'Test Blog Post',
        date: '2025-12-31',
        category: 'releases',
        content: '# Test Content\n\nThis is the post content.',
    };

    test('renders post header with title', () => {
        render(<BlogPost {...mockProps} />);

        expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    test('renders category badge', () => {
        render(<BlogPost {...mockProps} />);

        expect(screen.getByText('releases')).toBeInTheDocument();
    });

    test('renders formatted date', () => {
        render(<BlogPost {...mockProps} />);

        const timeElement = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'time';
        });

        expect(timeElement).toBeInTheDocument();
        expect(timeElement).toHaveAttribute('dateTime', '2025-12-31');
    });

    test('renders markdown content', () => {
        const { container } = render(<BlogPost {...mockProps} />);

        // The mocked react-markdown just renders the content as-is
        // Check that the content is present somewhere in the component
        expect(container.textContent).toContain('Test Content');
        expect(container.textContent).toContain('This is the post content');
    });

    test('renders with different category', () => {
        const filmsProps = { ...mockProps, category: 'films' };
        render(<BlogPost {...filmsProps} />);

        expect(screen.getByText('films')).toBeInTheDocument();
    });

    test('renders article element', () => {
        const { container } = render(<BlogPost {...mockProps} />);

        const article = container.querySelector('article');
        expect(article).toBeInTheDocument();
    });

    test('header contains all metadata', () => {
        render(<BlogPost {...mockProps} />);

        const header = screen
            .getByText('Test Blog Post')
            .closest('header') as HTMLElement;

        expect(header).toBeInTheDocument();
        expect(header).toContainElement(screen.getByText('releases'));
        expect(
            header.querySelector('time[datetime="2025-12-31"]')
        ).toBeInTheDocument();
    });
});
