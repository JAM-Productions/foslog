import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { RatingInput, RatingDisplay } from '@/components/ui/rating';

describe('RatingInput', () => {
    it('renders with default props', () => {
        render(<RatingInput />);
        const stars = screen.getAllByRole('button');
        expect(stars).toHaveLength(5);
        expect(stars[0]).toHaveClass('focus:ring-ring');
    });

    it('displays the correct rating value', () => {
        render(<RatingInput value={3} />);
        const filledStars = screen
            .getAllByRole('button')
            .filter((star) =>
                star.querySelector('svg')?.classList.contains('fill-amber-400')
            );
        expect(filledStars).toHaveLength(3);
    });

    it('calls onChange when star is clicked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<RatingInput onChange={onChange} />);
        const fourthStar = screen.getAllByRole('button')[3];

        await user.click(fourthStar);
        expect(onChange).toHaveBeenCalledWith(4);
    });

    it('shows hover state correctly', async () => {
        const user = userEvent.setup();
        render(<RatingInput />);

        const thirdStar = screen.getAllByRole('button')[2];
        await user.hover(thirdStar);

        // Check if hover effects are applied
        expect(thirdStar).toHaveClass('hover:scale-110');
    });

    it('does not allow interaction when readonly', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <RatingInput
                readonly
                onChange={onChange}
            />
        );
        const star = screen.getAllByRole('button')[0];

        await user.click(star);
        expect(onChange).not.toHaveBeenCalled();
        expect(star).toHaveClass('cursor-default');
    });

    it('shows rating value when showValue is true', () => {
        render(
            <RatingInput
                value={4}
                showValue
            />
        );
        expect(screen.getByText('4/5')).toBeInTheDocument();
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
        render(<RatingDisplay rating={3} />);
        const stars = screen.getAllByRole('button');
        expect(stars[0]).toHaveClass('cursor-default');
    });

    it('shows value by default', () => {
        render(<RatingDisplay rating={5} />);
        expect(screen.getByText('5/5')).toBeInTheDocument();
    });

    it('hides value when showValue is false', () => {
        render(
            <RatingDisplay
                rating={5}
                showValue={false}
            />
        );
        expect(screen.queryByText('5/5')).not.toBeInTheDocument();
    });
});
