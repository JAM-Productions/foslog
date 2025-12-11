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
        // expect(screen.getByText('5')).toBeInTheDocument(); // REMOVED: Ambiguous, found multiple (label and count)
        // "5" appears as a count for 4 stars, and "5" appears as a label for 5 stars.

        // We can check that we have the count '5' associated with the 4-star row if we had better selectors,
        // but for now checking that '5' appears twice (label and count) is enough?
        // Actually, let's just use getAllByText('5') and ensure we find enough of them.
        expect(screen.getAllByText('5')).toHaveLength(2); // One label "5", one count "5"
        expect(screen.getAllByText('1')).toHaveLength(1); // Only label "1". Count is "2".
        expect(screen.getAllByText('2')).toHaveLength(2); // One label "2", one count "2" (for rating 1)

        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getAllByText('0')).toHaveLength(2); // 0 counts should be shown (for rating 3 and 2)
        // Component logic: const count = distribution[rating] || 0;
        // It renders the count "0" if distribution[rating] is undefined/0.
        // My previous test assumption was that it renders zeros.
        // Let's verify component logic: <div ...>{count}</div>. So 0 is rendered.
        // My mock distribution has 0s for 3 and 2? No, I only provided 5, 4, 1.
        // ratings = [5, 4, 3, 2, 1].
        // 3 -> 0, 2 -> 0.
        // So 0 should be in the document.
        expect(screen.getAllByText('0')).toHaveLength(2); // For rating 3 and 2.
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
