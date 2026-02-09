import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { RatingInput, RatingDisplay } from '@/components/input/rating';

describe('RatingInput', () => {
    it('renders with default props', () => {
        render(<RatingInput />);
        const stars = screen.getAllByRole('button');
        expect(stars).toHaveLength(5);
        expect(stars[0]).toHaveClass('rounded');
    });

    it('displays the correct rating value', () => {
        render(<RatingInput value={3} />);
        const stars = screen.getAllByRole('button');
        // Check the first 3 stars have the filled star (there should be 2 SVGs in each filled star)
        const firstStar = stars[0];
        const svgs = firstStar.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThan(1); // Should have both base and filled SVG
    });

    it('displays half stars correctly', () => {
        render(<RatingInput value={3.5} />);
        const stars = screen.getAllByRole('button');

        // Stars 1, 2, 3 should be filled
        for (let i = 0; i < 3; i++) {
            const svgs = stars[i].querySelectorAll('svg');
            // One for base star, one for filled star
            expect(svgs.length).toBe(2);
        }

        // Star 4 should be half filled
        const fourthStar = stars[3];
        const svgs = fourthStar.querySelectorAll('svg');
        // One for base star, one for half-filled star
        expect(svgs.length).toBe(2);
        // Check for StarHalf (lucide-react icons have data-lucide attribute if using the lucide-react-native or similar,
        // but here they are just SVGs. We can check class names or other markers)
        // In our implementation, we add StarHalf component.
    });

    it('calls onChange with half value when left side of star is clicked', async () => {
        const onChange = vi.fn();
        render(<RatingInput onChange={onChange} />);

        const stars = screen.getAllByRole('button');
        const firstStar = stars[0];

        // Mock getBoundingClientRect
        firstStar.getBoundingClientRect = vi.fn(() => ({
            left: 0,
            top: 0,
            width: 40,
            height: 40,
            bottom: 40,
            right: 40,
            x: 0,
            y: 0,
            toJSON: () => {},
        }));

        fireEvent.click(firstStar, { clientX: 10 }); // Left side (10 < 40/2)
        expect(onChange).toHaveBeenCalledWith(0.5);

        fireEvent.click(firstStar, { clientX: 30 }); // Right side (30 > 40/2)
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it('shows hover state for half stars', async () => {
        render(<RatingInput />);
        const firstStar = screen.getAllByRole('button')[0];

        firstStar.getBoundingClientRect = vi.fn(() => ({
            left: 0,
            top: 0,
            width: 40,
            height: 40,
            bottom: 40,
            right: 40,
            x: 0,
            y: 0,
            toJSON: () => {},
        }));

        fireEvent.mouseMove(firstStar, { clientX: 10 }); // Hover left side

        // When hovering 0.5, the first star should have StarHalf
        const svgs = firstStar.querySelectorAll('svg');
        expect(svgs.length).toBe(2);
    });

    it('does not allow interaction when readonly', async () => {
        const onChange = vi.fn();

        render(
            <RatingInput
                readonly
                onChange={onChange}
            />
        );
        const star = screen.getAllByRole('button')[0];

        fireEvent.click(star);
        expect(onChange).not.toHaveBeenCalled();
        expect(star).toHaveClass('cursor-default');
    });

    it('shows rating value when showValue is true', () => {
        render(
            <RatingInput
                value={4.5}
                showValue
            />
        );
        expect(screen.getByText('4.5/5')).toBeInTheDocument();
    });

    it('shows "No rating" when value is 0 and showValue is true', () => {
        render(
            <RatingInput
                value={0}
                showValue
            />
        );
        expect(screen.getByText('No rating')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
        const { rerender } = render(<RatingInput size="sm" />);
        let stars = screen.getAllByRole('button');
        expect(stars[0].querySelector('svg')).toHaveClass('w-4', 'h-4');

        rerender(<RatingInput size="md" />);
        stars = screen.getAllByRole('button');
        expect(stars[0].querySelector('svg')).toHaveClass('w-5', 'h-5');

        rerender(<RatingInput size="lg" />);
        stars = screen.getAllByRole('button');
        expect(stars[0].querySelector('svg')).toHaveClass('w-6', 'h-6');
    });

    it('applies custom className', () => {
        render(<RatingInput className="custom-rating" />);
        const container = screen
            .getAllByRole('button')[0]
            .closest('div')?.parentElement;
        expect(container).toHaveClass('custom-rating');
    });
});

describe('RatingDisplay', () => {
    it('renders as readonly rating input', () => {
        render(<RatingDisplay rating={3.5} />);
        const stars = screen.getAllByRole('button');
        expect(stars[0]).toHaveClass('cursor-default');
    });

    it('shows value by default', () => {
        render(<RatingDisplay rating={4.5} />);
        expect(screen.getByText('4.5/5')).toBeInTheDocument();
    });

    it('hides value when showValue is false', () => {
        render(
            <RatingDisplay
                rating={4.5}
                showValue={false}
            />
        );
        expect(screen.queryByText('4.5/5')).not.toBeInTheDocument();
    });
});
