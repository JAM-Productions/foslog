import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserListSkeleton from '@/components/user/user-list-skeleton';

describe('UserListSkeleton', () => {
    it('renders skeleton with 5 placeholder items', () => {
        render(<UserListSkeleton />);

        const skeletons = screen
            .getAllByRole('generic')
            .filter((el) => el.className.includes('animate-pulse'));

        expect(skeletons.length).toBeGreaterThanOrEqual(15);
    });
});
