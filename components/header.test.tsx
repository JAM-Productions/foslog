import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '@/components/header';
import { useTranslations } from 'next-intl';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

// Mock all the sub-components
vi.mock('@/components/media-type-filter', () => ({
    default: () => <div data-testid="media-type-filter">Media Type Filter</div>,
}));

vi.mock('@/components/theme-toggle', () => ({
    default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('@/components/user-menu', () => ({
    default: () => <div data-testid="user-menu">User Menu</div>,
}));

vi.mock('@/components/search-bar', () => ({
    default: () => <div data-testid="search-bar">Search Bar</div>,
}));

vi.mock('@/components/language-selector', () => ({
    default: () => <div data-testid="language-selector">Language Selector</div>,
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
        ...props
    }: React.ImgHTMLAttributes<HTMLImageElement> & {
        src: string;
        alt: string;
    }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            {...props}
        />
    ),
}));

describe('Header', () => {
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            foslog: 'Foslog',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>
        );
    });

    it('renders the header with correct structure', () => {
        render(<Header />);

        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass(
            'bg-background/95',
            'supports-[backdrop-filter]:bg-background/60',
            'sticky',
            'top-0',
            'z-40',
            'w-full',
            'border-b',
            'backdrop-blur'
        );
    });

    it('displays the logo and brand name', () => {
        render(<Header />);

        const logo = screen.getByAltText('Foslog');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/favicon.svg');
        expect(logo).toHaveAttribute('width', '32');
        expect(logo).toHaveAttribute('height', '32');

        const brandName = screen.getByText('Foslog');
        expect(brandName).toBeInTheDocument();
        expect(brandName).toHaveClass('text-xl', 'font-bold', 'tracking-tight');
    });

    it('renders all sub-components', () => {
        render(<Header />);

        expect(screen.getByTestId('media-type-filter')).toBeInTheDocument();
        expect(screen.getByTestId('language-selector')).toBeInTheDocument();
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('user-menu')).toBeInTheDocument();
        expect(screen.getAllByTestId('search-bar')).toHaveLength(2); // Desktop and mobile versions
    });

    it('has responsive search bar layout', () => {
        render(<Header />);

        const searchBars = screen.getAllByTestId('search-bar');

        // Desktop search bar (hidden on mobile)
        expect(searchBars[0].parentElement).toHaveClass(
            'mx-8',
            'hidden',
            'max-w-md',
            'flex-1',
            'md:flex'
        );

        // Mobile search bar (visible only on mobile)
        expect(searchBars[1].parentElement).toHaveClass('pb-4', 'md:hidden');
    });

    it('has proper layout structure', () => {
        render(<Header />);

        // Main container
        const container = screen.getByText('Foslog').closest('.container');
        expect(container).toHaveClass('container', 'mx-auto', 'px-4');

        // Top row with logo, search, and actions - find the container with h-16 class
        const topRow = container?.querySelector('.h-16');
        expect(topRow).toHaveClass(
            'flex',
            'h-16',
            'items-center',
            'justify-between'
        );

        // Actions section
        const actionsSection =
            screen.getByTestId('language-selector').parentElement;
        expect(actionsSection).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('has proper spacing for components', () => {
        render(<Header />);

        // Logo section
        const logoSection = screen.getByText('Foslog').parentElement;
        expect(logoSection).toHaveClass('flex', 'items-center', 'gap-2');

        // Logo icon container
        const logoIconContainer = screen.getByAltText('Foslog').parentElement;
        expect(logoIconContainer).toHaveClass(
            'flex',
            'h-8',
            'w-8',
            'items-center',
            'justify-center'
        );

        // Media type filter section
        const mediaFilterSection =
            screen.getByTestId('media-type-filter').parentElement;
        expect(mediaFilterSection).toHaveClass('pb-4');
    });

    it('has correct image sizing classes', () => {
        render(<Header />);

        const logo = screen.getByAltText('Foslog');
        expect(logo).toHaveClass('h-8', 'w-8');
    });

    it('maintains proper component order', () => {
        render(<Header />);

        const header = screen.getByRole('banner');
        const children = Array.from(header.querySelectorAll('[data-testid]'));

        // Should have language selector, theme toggle, user menu, search bars (desktop + mobile), and media filter
        expect(children.length).toBeGreaterThanOrEqual(5);

        // Verify specific components exist
        expect(screen.getByTestId('language-selector')).toBeInTheDocument();
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('user-menu')).toBeInTheDocument();
        expect(screen.getByTestId('media-type-filter')).toBeInTheDocument();
    });

    it('has correct semantic structure', () => {
        render(<Header />);

        // Should be a header element
        const header = screen.getByRole('banner');
        expect(header.tagName).toBe('HEADER');

        // Logo should be properly structured
        const logoLink = screen.getByText('Foslog');
        expect(logoLink).toBeInTheDocument();
    });
});
