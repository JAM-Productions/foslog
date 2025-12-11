import { RatingDistribution } from '@/components/profile/rating-distribution';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock translations
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('RatingDistribution', () => {
    test('renders distribution bars correctly', () => {
        const distribution = {
            5: 10,
            4: 5,
            1: 2,
        };

        render(<RatingDistribution distribution={distribution} />);

        expect(screen.getByText('ratingDistribution')).toBeInTheDocument();

        // Check labels
        const rating5Label = screen.getAllByText('5')[0]; // The label "5"
        expect(rating5Label).toBeInTheDocument();

        // Check counts
        expect(screen.getByText('10')).toBeInTheDocument(); // Count for 5 stars
        expect(screen.getAllByText('5')).toHaveLength(2); // One label "5", one count "5"
        expect(screen.getAllByText('1')).toHaveLength(1); // Only label "1". Count is "2".
        expect(screen.getAllByText('2')).toHaveLength(2); // One label "2", one count "2" (for rating 1)

        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getAllByText('0')).toHaveLength(2); // 0 counts should be shown (for rating 3 and 2)
    });

    test('renders nothing when distribution is empty/zeros', () => {
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
