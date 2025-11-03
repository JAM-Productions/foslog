import { MediaDetails } from '@/components/media-details';
import { ReviewCard } from '@/components/review-card';
import { ReviewForm } from '@/components/review-form';
import { ReviewList } from '@/components/review-list';
import { mockMediaItems, mockReviews } from '@/lib/mock-data';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('MediaDetails', () => {
  it('renders media details correctly', () => {
    const media = mockMediaItems[0];
    render(<MediaDetails media={media} />);
    expect(screen.getByText(media.title)).toBeInTheDocument();
    expect(screen.getByText(media.type)).toBeInTheDocument();
    expect(screen.getByText(media.description)).toBeInTheDocument();
  });
});

describe('ReviewList', () => {
  it('renders a list of reviews', () => {
    render(<ReviewList reviews={mockReviews} />);
    mockReviews.forEach((review) => {
      expect(screen.getByText(review.review)).toBeInTheDocument();
    });
  });
});

describe('ReviewCard', () => {
  it('renders a review correctly', () => {
    const review = mockReviews[0];
    render(<ReviewCard review={review} />);
    expect(screen.getByText(review.review)).toBeInTheDocument();
  });
});

describe('ReviewForm', () => {
  it('renders a review form', () => {
    render(<ReviewForm />);
    expect(screen.getByLabelText('Rating')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});
