import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
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

    it('loops back to the first slide from the last slide', () => {
        renderCarousel();
        fireEvent.click(screen.getByRole('button', { name: /next/i })); // Go to the second slide
        fireEvent.click(screen.getByRole('button', { name: /next/i })); // Go to the third slide
        fireEvent.click(screen.getByRole('button', { name: /next/i })); // Go to the first slide
        const activeRegion = screen.getByRole('region', { hidden: false });
        expect(activeRegion).toHaveTextContent('4.5');
    });

    it('loops to the last slide from the first slide when clicking previous', async () => {
        renderCarousel();
        const activeRegion = screen.getByRole('region', { hidden: false });
        expect(activeRegion).toHaveTextContent('4.5');

        fireEvent.click(screen.getByRole('button', { name: /previous/i }));
        await waitFor(() => {
            expect(
                screen.getByRole('region', { hidden: false })
            ).toHaveTextContent('10');
        });
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

            // Tab to first button (previous)
            await user.tab();
            expect(prevButton).toHaveFocus();

            // Tab to second button (next)
            await user.tab();
            expect(nextButton).toHaveFocus();
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
});
