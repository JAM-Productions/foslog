import { RatingDistribution } from '@/components/profile/rating-distribution';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock translations
vi.mock('next-intl', () => ({
    useLocale: () => 'en',
    useTranslations: () => (key: string) => key,
}));

describe('RatingDistribution', () => {
    test('renders a column per half star step', () => {
        const distribution = {
            5: 10,
            4: 5,
            1: 2,
        };

        const { container } = render(
            <RatingDistribution distribution={distribution} />
        );

        expect(screen.getByText('ratingDistribution')).toBeInTheDocument();

        // Ten steps: 0.5 through 5.
        expect(container.querySelectorAll('[title]')).toHaveLength(10);

        // Each count is printed above its own column.
        expect(screen.getByTitle('5 ★ — 10')).toHaveTextContent('10');
        expect(screen.getByTitle('4 ★ — 5')).toHaveTextContent('5');
        expect(screen.getByTitle('1 ★ — 2')).toHaveTextContent('2');
        expect(screen.getByTitle('3.5 ★ — 0')).toHaveTextContent(/^$/);
    });

    test('gives half star ratings their own bucket', () => {
        const distribution = {
            5: 1,
            2.5: 3,
        };

        render(<RatingDistribution distribution={distribution} />);

        expect(screen.getByTitle('2.5 ★ — 3')).toHaveTextContent('3');
        expect(screen.getByTitle('3 ★ — 0')).toHaveTextContent(/^$/);
        expect(screen.getByTitle('2 ★ — 0')).toHaveTextContent(/^$/);
    });

    test('renders the likes and dislikes the user gave', () => {
        render(
            <RatingDistribution
                distribution={{ 5: 1 }}
                likesGiven={8}
                dislikesGiven={7}
            />
        );

        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('likesGiven')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('dislikesGiven')).toBeInTheDocument();
    });

    test('still renders when the user only gave likes and dislikes', () => {
        render(
            <RatingDistribution
                distribution={{}}
                likesGiven={3}
                dislikesGiven={0}
            />
        );

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('likesGiven')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('dislikesGiven')).toBeInTheDocument();
        expect(screen.queryByTitle('5 ★ — 0')).not.toBeInTheDocument();
    });

    test('renders nothing without ratings, likes or dislikes', () => {
        const distribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

        const { container } = render(
            <RatingDistribution distribution={distribution} />
        );

        expect(container).toBeEmptyDOMElement();
    });
});
