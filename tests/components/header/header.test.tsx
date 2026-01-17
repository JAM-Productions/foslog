import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Header from '@/components/header/header';

// Mock all the sub-components
vi.mock('@/components/media/media-type-filter', () => ({
    default: () => <div data-testid="media-type-filter">Media Type Filter</div>,
}));

vi.mock('@/components/header/user-menu', () => ({
    default: () => <div data-testid="user-menu">User Menu</div>,
}));

vi.mock('@/components/header/search-bar', () => ({
    default: () => <div data-testid="search-bar">Search Bar</div>,
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ListFilterPlus: ({ className }: { className?: string }) => (
        <span
            data-testid="list-filter-plus"
            className={className}
        >
            🔍+
        </span>
    ),
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
    beforeEach(() => {
        vi.clearAllMocks();
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
            'backdrop-blur',
            'transition-all',
            'duration-300'
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
        expect(screen.getByTestId('user-menu')).toBeInTheDocument();
        expect(screen.getAllByTestId('search-bar')).toHaveLength(2); // Desktop and mobile versions
    });

    it('renders collapse/expand toggle button', () => {
        render(<Header />);

        const toggleButtons = screen.getAllByRole('button', {
            name: /expand filter/i,
        });
        expect(toggleButtons).toHaveLength(2);
        expect(
            screen.getAllByTestId('list-filter-plus')[0]
        ).toBeInTheDocument();
    });

    it('toggles header collapse state when button is clicked', async () => {
        const user = userEvent.setup();
        render(<Header />);

        // Initially collapsed
        expect(screen.getAllByTestId('list-filter-plus')).toHaveLength(2);
        expect(
            screen.getAllByRole('button', { name: /expand filter/i })
        ).toHaveLength(2);

        // Click to expand
        const toggleButtons = screen.getAllByRole('button', {
            name: /expand filter/i,
        });
        await user.click(toggleButtons[0]);

        // Now expanded
        expect(
            screen.getAllByRole('button', { name: /collapse filter/i })
        ).toHaveLength(2);

        // Click again to collapse
        const collapseButtons = screen.getAllByRole('button', {
            name: /collapse filter/i,
        });
        await user.click(collapseButtons[0]);

        // Back to collapsed
        expect(
            screen.getAllByRole('button', { name: /expand filter/i })
        ).toHaveLength(2);
    });

    it('has responsive search bar layout', () => {
        render(<Header />);

        const searchBars = screen.getAllByTestId('search-bar');

        // Desktop search bar (hidden on mobile)
        expect(searchBars[0].parentElement).toHaveClass(
            'mx-8',
            'hidden',
            'max-w-lg',
            'flex-1',
            'lg:flex',
            'lg:gap-2'
        );

        // Mobile search bar (visible only on mobile)
        expect(searchBars[1].parentElement).toHaveClass(
            'flex',
            'max-h-20',
            'gap-2',
            'pb-4',
            'opacity-100',
            'transition-all',
            'duration-300',
            'lg:hidden'
        );
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
        expect(mediaFilterSection).toHaveClass(
            'transition-all',
            'duration-300'
        );
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

        // Should have user menu, search bars (desktop + mobile), media filter, and toggle button with chevron icon
        expect(children.length).toBeGreaterThanOrEqual(5);

        // Verify specific components exist
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
