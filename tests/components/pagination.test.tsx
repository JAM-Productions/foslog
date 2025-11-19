import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Pagination from '@/components/pagination/pagination';
import { useRouter, usePathname } from 'next/navigation';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
}));

describe('Pagination Component', () => {
    const mockPush = vi.fn();
    const mockPathname = '/test-path';

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
            push: mockPush,
        });
        (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
            mockPathname
        );
        // Mock window.location.search
        Object.defineProperty(window, 'location', {
            value: { search: '' },
            writable: true,
        });
    });

    describe('Rendering', () => {
        it('renders pagination controls with correct page numbers', () => {
            render(<Pagination currentPage={1} totalPages={5} />);

            expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
            expect(screen.getByLabelText('Next page')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
        });

        it('does not render when totalPages is 1', () => {
            const { container } = render(
                <Pagination currentPage={1} totalPages={1} />
            );

            expect(container).toBeEmptyDOMElement();
        });

        it('does not render when totalPages is 0', () => {
            const { container } = render(
                <Pagination currentPage={1} totalPages={0} />
            );

            expect(container).toBeEmptyDOMElement();
        });

        it('highlights the current page', () => {
            render(<Pagination currentPage={3} totalPages={5} />);

            const currentPageButton = screen.getByLabelText('Page 3');
            expect(currentPageButton).toHaveAttribute('aria-current', 'page');
        });

        it('shows ellipsis for large page counts', () => {
            render(<Pagination currentPage={5} totalPages={10} />);

            const ellipses = screen.getAllByText('...');
            expect(ellipses.length).toBeGreaterThan(0);
        });

        it('shows all pages when total is 7 or less', () => {
            render(<Pagination currentPage={1} totalPages={7} />);

            for (let i = 1; i <= 7; i++) {
                expect(screen.getByLabelText(`Page ${i}`)).toBeInTheDocument();
            }
        });
    });

    describe('Navigation', () => {
        it('disables Previous button on first page', () => {
            render(<Pagination currentPage={1} totalPages={5} />);

            const prevButton = screen.getByLabelText('Previous page');
            expect(prevButton).toBeDisabled();
        });

        it('disables Next button on last page', () => {
            render(<Pagination currentPage={5} totalPages={5} />);

            const nextButton = screen.getByLabelText('Next page');
            expect(nextButton).toBeDisabled();
        });

        it('enables Previous button when not on first page', () => {
            render(<Pagination currentPage={2} totalPages={5} />);

            const prevButton = screen.getByLabelText('Previous page');
            expect(prevButton).not.toBeDisabled();
        });

        it('enables Next button when not on last page', () => {
            render(<Pagination currentPage={1} totalPages={5} />);

            const nextButton = screen.getByLabelText('Next page');
            expect(nextButton).not.toBeDisabled();
        });
    });

    describe('User Interactions', () => {
        it('navigates to next page when Next button is clicked', async () => {
            const user = userEvent.setup();
            render(<Pagination currentPage={1} totalPages={5} />);

            const nextButton = screen.getByLabelText('Next page');
            await user.click(nextButton);

            expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?page=2`);
        });

        it('navigates to previous page when Previous button is clicked', async () => {
            const user = userEvent.setup();
            render(<Pagination currentPage={3} totalPages={5} />);

            const prevButton = screen.getByLabelText('Previous page');
            await user.click(prevButton);

            expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?page=2`);
        });

        it('navigates to specific page when page number is clicked', async () => {
            const user = userEvent.setup();
            render(<Pagination currentPage={1} totalPages={5} />);

            const page3Button = screen.getByLabelText('Page 3');
            await user.click(page3Button);

            expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?page=3`);
        });

        it('removes page parameter when navigating to page 1', async () => {
            const user = userEvent.setup();
            render(<Pagination currentPage={2} totalPages={5} />);

            const page1Button = screen.getByLabelText('Page 1');
            await user.click(page1Button);

            expect(mockPush).toHaveBeenCalledWith(mockPathname);
        });

        it('preserves existing query parameters', async () => {
            const user = userEvent.setup();
            Object.defineProperty(window, 'location', {
                value: { search: '?filter=active&sort=name' },
                writable: true,
            });

            render(<Pagination currentPage={1} totalPages={5} />);

            const page2Button = screen.getByLabelText('Page 2');
            await user.click(page2Button);

            expect(mockPush).toHaveBeenCalledWith(
                `${mockPathname}?filter=active&sort=name&page=2`
            );
        });

        it('calls onPageChange callback when provided', async () => {
            const user = userEvent.setup();
            const onPageChange = vi.fn();
            render(
                <Pagination
                    currentPage={1}
                    totalPages={5}
                    onPageChange={onPageChange}
                />
            );

            const page2Button = screen.getByLabelText('Page 2');
            await user.click(page2Button);

            expect(onPageChange).toHaveBeenCalledWith(2);
        });

        it('does not navigate when clicking current page', async () => {
            const user = userEvent.setup();
            render(<Pagination currentPage={3} totalPages={5} />);

            const currentPageButton = screen.getByLabelText('Page 3');
            await user.click(currentPageButton);

            expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?page=3`);
        });
    });

    describe('Edge Cases', () => {
        it('does not navigate beyond first page', async () => {
            const user = userEvent.setup();
            render(<Pagination currentPage={1} totalPages={5} />);

            const prevButton = screen.getByLabelText('Previous page');
            await user.click(prevButton);

            expect(mockPush).not.toHaveBeenCalled();
        });

        it('does not navigate beyond last page', async () => {
            const user = userEvent.setup();
            render(<Pagination currentPage={5} totalPages={5} />);

            const nextButton = screen.getByLabelText('Next page');
            await user.click(nextButton);

            expect(mockPush).not.toHaveBeenCalled();
        });

        it('handles single page correctly', () => {
            const { container } = render(
                <Pagination currentPage={1} totalPages={1} />
            );

            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels for navigation buttons', () => {
            render(<Pagination currentPage={2} totalPages={5} />);

            expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
            expect(screen.getByLabelText('Next page')).toBeInTheDocument();
        });

        it('has proper ARIA labels for page buttons', () => {
            render(<Pagination currentPage={1} totalPages={5} />);

            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
        });

        it('marks current page with aria-current', () => {
            render(<Pagination currentPage={3} totalPages={5} />);

            const currentPage = screen.getByLabelText('Page 3');
            expect(currentPage).toHaveAttribute('aria-current', 'page');
        });

        it('does not mark non-current pages with aria-current', () => {
            render(<Pagination currentPage={3} totalPages={5} />);

            const page1 = screen.getByLabelText('Page 1');
            expect(page1).not.toHaveAttribute('aria-current');
        });
    });

    describe('Page Number Display Logic', () => {
        it('shows pages around current page in middle range', () => {
            render(<Pagination currentPage={5} totalPages={10} />);

            // Should show: 1 ... 4 5 6 ... 10
            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 4')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 6')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
        });

        it('shows correct pages when near the start', () => {
            render(<Pagination currentPage={2} totalPages={10} />);

            // Should show: 1 2 3 ... 10
            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
        });

        it('shows correct pages when near the end', () => {
            render(<Pagination currentPage={9} totalPages={10} />);

            // Should show: 1 ... 8 9 10
            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 8')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 9')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
        });
    });
});
