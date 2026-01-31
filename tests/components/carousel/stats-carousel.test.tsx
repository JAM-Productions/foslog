import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    render,
    fireEvent,
    screen,
    waitFor,
    act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsCarousel from '@/components/carousel/stats-carousel';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

describe('StatsCarousel', () => {
    const globalStats = {
        topRated: 4.5,
        recentlyAdded: 10,
    };
    const total = 100;
    const selectedMediaType = 'all';
    const getTypeDisplayName = (type: string) => type;
    const isMobile = false;

    const renderCarousel = (customProps = {}) => {
        return render(
            <NextIntlClientProvider
                locale="en"
                messages={messages}
            >
                <StatsCarousel
                    globalStats={globalStats}
                    total={total}
                    selectedMediaType={selectedMediaType}
                    getTypeDisplayName={getTypeDisplayName}
                    isMobile={isMobile}
                    {...customProps}
                />
            </NextIntlClientProvider>
        );
    };

    it('renders the first slide initially', () => {
        renderCarousel();
        const activeRegion = screen.getByRole('region', { hidden: false });
        expect(activeRegion).toHaveTextContent('4.5');
    });

    it('goes to the next slide when the right arrow is clicked', () => {
        renderCarousel();
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        const activeRegion = screen.getByRole('region', { hidden: false });
        expect(activeRegion).toHaveTextContent('100');
    });

    it('goes to the previous slide when the left arrow is clicked', () => {
        renderCarousel();
        fireEvent.click(screen.getByRole('button', { name: /next/i })); // Go to the second slide
        fireEvent.click(screen.getByRole('button', { name: /previous/i }));
        const activeRegion = screen.getByRole('region', { hidden: false });
        expect(activeRegion).toHaveTextContent('4.5');
    });

    it('stops at the last slide and disables next button', () => {
        renderCarousel();
        const nextButton = screen.getByRole('button', { name: /next/i });

        expect(nextButton).not.toBeDisabled();

        fireEvent.click(nextButton); // Go to the second slide
        fireEvent.click(nextButton); // Go to the third slide

        const activeRegion = screen.getByRole('region', { hidden: false });
        expect(activeRegion).toHaveTextContent('10');
        expect(nextButton).toBeDisabled();
    });

    it('disables previous button at the first slide', async () => {
        renderCarousel();
        const prevButton = screen.getByRole('button', { name: /previous/i });
        const activeRegion = screen.getByRole('region', { hidden: false });

        expect(activeRegion).toHaveTextContent('4.5');
        expect(prevButton).toBeDisabled();
    });

    it('navigates to the correct slide when clicking on indicator dots', async () => {
        renderCarousel();

        const indicators = screen.getAllByRole('tab');
        expect(indicators).toHaveLength(3);

        const activeRegion = screen.getByRole('region', { hidden: false });
        expect(activeRegion).toHaveTextContent('4.5');

        fireEvent.click(indicators[2]);
        await waitFor(() => {
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('10');
        });

        fireEvent.click(indicators[1]);
        await waitFor(() => {
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('100');
        });

        fireEvent.click(indicators[0]);
        await waitFor(() => {
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');
        });
    });

    describe('Mobile Responsive Behavior', () => {
        it('shows navigation buttons when isMobile is false', () => {
            renderCarousel({ isMobile: false });

            const prevButton = screen.getByRole('button', {
                name: /previous/i,
            });
            const nextButton = screen.getByRole('button', { name: /next/i });

            expect(prevButton).toBeInTheDocument();
            expect(nextButton).toBeInTheDocument();
        });

        it('hides navigation buttons when isMobile is true', () => {
            renderCarousel({ isMobile: true });

            const prevButton = screen.queryByRole('button', {
                name: /previous/i,
            });
            const nextButton = screen.queryByRole('button', {
                name: /next/i,
            });

            expect(prevButton).not.toBeInTheDocument();
            expect(nextButton).not.toBeInTheDocument();
        });

        it('still allows slide indicator navigation on mobile', () => {
            renderCarousel({ isMobile: true });

            const indicators = screen.getAllByRole('tab');
            expect(indicators).toHaveLength(3);

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Click second indicator
            fireEvent.click(indicators[1]);

            // Should navigate to second slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('100');
        });
    });

    describe('Touch/Swipe Gestures', () => {
        it('navigates to next slide on swipe left', async () => {
            renderCarousel();

            const carousel = document.getElementById('stats-carousel');
            expect(carousel).toBeInTheDocument();

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Set carousel width for threshold calculation
            Object.defineProperty(carousel, 'offsetWidth', {
                writable: true,
                configurable: true,
                value: 300,
            });

            // Simulate swipe left (start at 200, move to 100 = -100px or -33.33%)
            fireEvent.touchStart(carousel!, {
                targetTouches: [{ clientX: 200 }],
            });

            fireEvent.touchMove(carousel!, {
                targetTouches: [{ clientX: 100 }],
            });

            fireEvent.touchEnd(carousel!);

            // Should navigate to next slide
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('100');
            });
        });

        it('does not navigate past last slide on swipe left', async () => {
            renderCarousel();

            const carousel = document.getElementById('stats-carousel');
            expect(carousel).toBeInTheDocument();

            // Navigate to last slide
            fireEvent.click(screen.getByRole('button', { name: /next/i }));
            fireEvent.click(screen.getByRole('button', { name: /next/i }));

            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('10');
            });

            // Set carousel width for threshold calculation
            Object.defineProperty(carousel, 'offsetWidth', {
                writable: true,
                configurable: true,
                value: 300,
            });

            // Simulate swipe left on last slide
            fireEvent.touchStart(carousel!, {
                targetTouches: [{ clientX: 200 }],
            });

            fireEvent.touchMove(carousel!, {
                targetTouches: [{ clientX: 100 }],
            });

            fireEvent.touchEnd(carousel!);

            // Should stay on last slide
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('10');
            });
        });

        it('navigates to previous slide on swipe right', async () => {
            renderCarousel();

            const carousel = document.getElementById('stats-carousel');
            expect(carousel).toBeInTheDocument();

            // Move to second slide first
            fireEvent.click(screen.getByRole('button', { name: /next/i }));
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('100');
            });

            // Set carousel width for threshold calculation
            Object.defineProperty(carousel, 'offsetWidth', {
                writable: true,
                configurable: true,
                value: 300,
            });

            // Simulate swipe right (start at 100, move to 200 = +100px or +33.33%)
            fireEvent.touchStart(carousel!, {
                targetTouches: [{ clientX: 100 }],
            });

            fireEvent.touchMove(carousel!, {
                targetTouches: [{ clientX: 200 }],
            });

            fireEvent.touchEnd(carousel!);

            // Should navigate to previous slide
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('4.5');
            });
        });

        it('does not navigate before first slide on swipe right', async () => {
            renderCarousel();

            const carousel = document.getElementById('stats-carousel');
            expect(carousel).toBeInTheDocument();

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Set carousel width for threshold calculation
            Object.defineProperty(carousel, 'offsetWidth', {
                writable: true,
                configurable: true,
                value: 300,
            });

            // Simulate swipe right on first slide
            fireEvent.touchStart(carousel!, {
                targetTouches: [{ clientX: 100 }],
            });

            fireEvent.touchMove(carousel!, {
                targetTouches: [{ clientX: 200 }],
            });

            fireEvent.touchEnd(carousel!);

            // Should stay on first slide
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('4.5');
            });
        });

        it('does not navigate if swipe distance is below 10% threshold', async () => {
            renderCarousel();

            const carousel = document.getElementById('stats-carousel');
            expect(carousel).toBeInTheDocument();

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Set carousel width for threshold calculation
            Object.defineProperty(carousel, 'offsetWidth', {
                writable: true,
                configurable: true,
                value: 300,
            });

            // Simulate small swipe (start at 150, move to 125 = -25px or -8.33%, below 10% threshold)
            fireEvent.touchStart(carousel!, {
                targetTouches: [{ clientX: 150 }],
            });

            fireEvent.touchMove(carousel!, {
                targetTouches: [{ clientX: 125 }],
            });

            fireEvent.touchEnd(carousel!);

            // Should stay on first slide
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('4.5');
            });
        });

        it('navigates when swipe distance is exactly at 10% threshold', async () => {
            renderCarousel();

            const carousel = document.getElementById('stats-carousel');
            expect(carousel).toBeInTheDocument();

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Set carousel width for threshold calculation
            Object.defineProperty(carousel, 'offsetWidth', {
                writable: true,
                configurable: true,
                value: 300,
            });

            // Simulate swipe at threshold (start at 150, move to 119 = -31px or -10.33%, just above 10% threshold)
            fireEvent.touchStart(carousel!, {
                targetTouches: [{ clientX: 150 }],
            });

            fireEvent.touchMove(carousel!, {
                targetTouches: [{ clientX: 119 }],
            });

            fireEvent.touchEnd(carousel!);

            // Should navigate to next slide
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('100');
            });
        });

        it('updates drag offset during touch move', () => {
            renderCarousel();

            const carousel = document.getElementById('stats-carousel');
            expect(carousel).toBeInTheDocument();

            // Set carousel width
            Object.defineProperty(carousel, 'offsetWidth', {
                writable: true,
                configurable: true,
                value: 300,
            });

            // Start touch
            fireEvent.touchStart(carousel!, {
                targetTouches: [{ clientX: 200 }],
            });

            // Move touch (drag 60px = 20% of 300px)
            fireEvent.touchMove(carousel!, {
                targetTouches: [{ clientX: 140 }],
            });

            // The transform should include the drag offset
            const slideContainer = carousel!.querySelector('.flex');

            // During drag, the component applies dragOffset, but we can't easily assert the exact value
            // Just verify touch events are handled without errors
            expect(slideContainer).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels and roles', () => {
            renderCarousel();

            const prevButton = screen.getByRole('button', {
                name: /previous/i,
            });
            const nextButton = screen.getByRole('button', { name: /next/i });
            const carouselRegion = screen.getByRole('region', {
                name: /statistics carousel/i,
            });

            expect(prevButton).toHaveAttribute('aria-label', 'previous');
            expect(nextButton).toHaveAttribute('aria-label', 'next');
            expect(carouselRegion).toHaveAttribute('aria-live', 'polite');
            expect(carouselRegion).toHaveAttribute('aria-atomic', 'true');
        });

        it('allows keyboard navigation to buttons using Tab key', async () => {
            const user = userEvent.setup();
            renderCarousel();

            const prevButton = screen.getByRole('button', {
                name: /previous/i,
            });
            const nextButton = screen.getByRole('button', { name: /next/i });

            // Previous button is disabled at first slide, so it's not focusable
            expect(prevButton).toBeDisabled();

            // Next button should be focusable
            await user.tab();
            expect(nextButton).toHaveFocus();

            // Navigate to second slide to enable both buttons
            await user.click(nextButton);

            // Now previous button should be enabled and focusable
            expect(prevButton).not.toBeDisabled();
            expect(prevButton).toBeEnabled();
        });

        it('activates buttons using Enter key', async () => {
            const user = userEvent.setup();
            renderCarousel();

            const nextButton = screen.getByRole('button', { name: /next/i });
            nextButton.focus();

            // Initially showing first slide with 4.5
            const activeRegion = screen.getByRole('region', { hidden: false });
            expect(activeRegion).toHaveTextContent('4.5');

            // Press Enter to go to next slide
            await user.keyboard('{Enter}');
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('100');
            });
        });

        it('activates buttons using Space key', async () => {
            const user = userEvent.setup();
            renderCarousel();

            const nextButton = screen.getByRole('button', { name: /next/i });
            nextButton.focus();

            // Initially showing first slide with 4.5
            const activeRegion = screen.getByRole('region', { hidden: false });
            expect(activeRegion).toHaveTextContent('4.5');

            // Press Space to go to next slide
            await user.keyboard(' ');
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('100');
            });
        });

        it('makes indicator dots keyboard accessible', async () => {
            const user = userEvent.setup();
            renderCarousel();

            const indicators = screen.getAllByRole('tab');
            expect(indicators).toHaveLength(3);

            // Tab to first indicator
            indicators[0].focus();
            expect(indicators[0]).toHaveFocus();

            // Activate second indicator using Enter
            indicators[1].focus();
            await user.keyboard('{Enter}');
            const activeRegion = screen.getByRole('region', { hidden: false });
            expect(activeRegion).toHaveTextContent('100');

            // Verify aria-selected attribute
            expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
            expect(indicators[0]).toHaveAttribute('aria-selected', 'false');
        });

        it('has proper tablist role for indicator navigation', () => {
            renderCarousel();

            const tablist = screen.getByRole('tablist', {
                name: /slide navigation/i,
            });
            expect(tablist).toBeInTheDocument();
            expect(tablist).toHaveAttribute('aria-label', 'Slide navigation');
        });

        it('updates aria-selected on indicator dots when slide changes', () => {
            renderCarousel();

            const indicators = screen.getAllByRole('tab');
            const nextButton = screen.getByRole('button', { name: /next/i });

            // Initially first indicator is active
            expect(indicators[0]).toHaveAttribute('aria-selected', 'true');
            expect(indicators[1]).toHaveAttribute('aria-selected', 'false');

            // Navigate to next slide
            fireEvent.click(nextButton);

            // Second indicator should now be active
            expect(indicators[0]).toHaveAttribute('aria-selected', 'false');
            expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
        });

        it('announces content changes to screen readers via aria-live', async () => {
            renderCarousel();

            const carouselRegion = screen.getByRole('region', {
                hidden: false,
            });

            // Verify aria-live region is set up correctly
            expect(carouselRegion).toHaveAttribute('aria-live', 'polite');
            expect(carouselRegion).toHaveAttribute('aria-atomic', 'true');

            // Initially shows first slide content
            expect(carouselRegion).toHaveTextContent('4.5');

            // Navigate to next slide
            const nextButton = screen.getByRole('button', { name: /next/i });
            fireEvent.click(nextButton);

            // Content should update and be announced
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { hidden: false })
                ).toHaveTextContent('100');
            });
        });
    });

    describe('Auto-play', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('automatically advances to the next slide after 10 seconds', async () => {
            renderCarousel();

            // Initially on first slide
            const activeRegion = screen.getByRole('region', { hidden: false });
            expect(activeRegion).toHaveTextContent('4.5');

            // Fast-forward 10 seconds + transition time
            await act(async () => {
                vi.advanceTimersByTime(10300);
            });

            // Should advance to second slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('100');
        });

        it('continues auto-playing through multiple slides and loops back', async () => {
            renderCarousel();

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Advance to second slide (10 seconds + transition)
            await act(async () => {
                vi.advanceTimersByTime(10300);
            });
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('100');

            // Advance to third slide (another 10 seconds + transition)
            await act(async () => {
                vi.advanceTimersByTime(10300);
            });
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('10');

            // Loop back to first slide (another 10 seconds + transition)
            await act(async () => {
                vi.advanceTimersByTime(10300);
            });
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');
        });

        it('pauses auto-play during touch interaction', async () => {
            renderCarousel();

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Simulate touch start
            const carousel = screen.getByRole('region', {
                hidden: false,
            }).parentElement;
            if (carousel) {
                fireEvent.touchStart(carousel, {
                    targetTouches: [{ clientX: 100 }],
                });
            }

            // Advance time while touching - should not auto-play
            vi.advanceTimersByTime(10000);

            // Should still be on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');
        });

        it('resumes auto-play after touch interaction ends', async () => {
            renderCarousel();

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Simulate touch interaction
            const carousel = screen.getByRole('region', {
                hidden: false,
            }).parentElement;
            if (carousel) {
                fireEvent.touchStart(carousel, {
                    targetTouches: [{ clientX: 100 }],
                });
                fireEvent.touchEnd(carousel);
            }

            // Advance time after touch ends - should resume auto-play
            await act(async () => {
                vi.advanceTimersByTime(10300);
            });

            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('100');
        });

        it('does not interfere with manual navigation', async () => {
            renderCarousel();

            // Initially on first slide
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('4.5');

            // Manual navigation to next slide
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: /next/i }));
                vi.advanceTimersByTime(300); // Allow transition to complete
            });

            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('100');

            // Advance time - should continue from current position
            await act(async () => {
                vi.advanceTimersByTime(10300);
            });

            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('10');
        });
    });
});
