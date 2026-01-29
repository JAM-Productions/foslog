import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
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

    it('renders the first slide initially', () => {
        render(
            <NextIntlClientProvider
                locale="en"
                messages={messages}
            >
                <StatsCarousel
                    globalStats={globalStats}
                    total={total}
                    selectedMediaType={selectedMediaType}
                    getTypeDisplayName={getTypeDisplayName}
                />
            </NextIntlClientProvider>
        );
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('goes to the next slide when the right arrow is clicked', () => {
        render(
            <NextIntlClientProvider
                locale="en"
                messages={messages}
            >
                <StatsCarousel
                    globalStats={globalStats}
                    total={total}
                    selectedMediaType={selectedMediaType}
                    getTypeDisplayName={getTypeDisplayName}
                />
            </NextIntlClientProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('goes to the previous slide when the left arrow is clicked', () => {
        render(
            <NextIntlClientProvider
                locale="en"
                messages={messages}
            >
                <StatsCarousel
                    globalStats={globalStats}
                    total={total}
                    selectedMediaType={selectedMediaType}
                    getTypeDisplayName={getTypeDisplayName}
                />
            </NextIntlClientProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: /next/i })); // Go to the second slide
        fireEvent.click(screen.getByRole('button', { name: /previous/i }));
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('loops back to the first slide from the last slide', () => {
        render(
            <NextIntlClientProvider
                locale="en"
                messages={messages}
            >
                <StatsCarousel
                    globalStats={globalStats}
                    total={total}
                    selectedMediaType={selectedMediaType}
                    getTypeDisplayName={getTypeDisplayName}
                />
            </NextIntlClientProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: /next/i })); // Go to the second slide
        fireEvent.click(screen.getByRole('button', { name: /next/i })); // Go to the third slide
        fireEvent.click(screen.getByRole('button', { name: /next/i })); // Go to the first slide
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('loops to the last slide from the first slide when clicking previous', () => {
        render(
            <NextIntlClientProvider
                locale="en"
                messages={messages}
            >
                <StatsCarousel
                    globalStats={globalStats}
                    total={total}
                    selectedMediaType={selectedMediaType}
                    getTypeDisplayName={getTypeDisplayName}
                />
            </NextIntlClientProvider>
        );
        expect(screen.getByText('4.5')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /previous/i }));
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('navigates to the correct slide when clicking on indicator dots', () => {
        render(
            <NextIntlClientProvider
                locale="en"
                messages={messages}
            >
                <StatsCarousel
                    globalStats={globalStats}
                    total={total}
                    selectedMediaType={selectedMediaType}
                    getTypeDisplayName={getTypeDisplayName}
                />
            </NextIntlClientProvider>
        );

        const indicators = screen.getAllByRole('tab');
        expect(indicators).toHaveLength(3);

        expect(screen.getByText('4.5')).toBeInTheDocument();
        fireEvent.click(indicators[2]);
        expect(screen.getByText('10')).toBeInTheDocument();
        fireEvent.click(indicators[1]);
        expect(screen.getByText('100')).toBeInTheDocument();
        fireEvent.click(indicators[0]);
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels and roles', () => {
            render(
                <NextIntlClientProvider
                    locale="en"
                    messages={messages}
                >
                    <StatsCarousel
                        globalStats={globalStats}
                        total={total}
                        selectedMediaType={selectedMediaType}
                        getTypeDisplayName={getTypeDisplayName}
                    />
                </NextIntlClientProvider>
            );

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
            render(
                <NextIntlClientProvider
                    locale="en"
                    messages={messages}
                >
                    <StatsCarousel
                        globalStats={globalStats}
                        total={total}
                        selectedMediaType={selectedMediaType}
                        getTypeDisplayName={getTypeDisplayName}
                    />
                </NextIntlClientProvider>
            );

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
            render(
                <NextIntlClientProvider
                    locale="en"
                    messages={messages}
                >
                    <StatsCarousel
                        globalStats={globalStats}
                        total={total}
                        selectedMediaType={selectedMediaType}
                        getTypeDisplayName={getTypeDisplayName}
                    />
                </NextIntlClientProvider>
            );

            const nextButton = screen.getByRole('button', { name: /next/i });
            nextButton.focus();

            // Initially showing first slide with 4.5
            expect(screen.getByText('4.5')).toBeInTheDocument();

            // Press Enter to go to next slide
            await user.keyboard('{Enter}');
            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('activates buttons using Space key', async () => {
            const user = userEvent.setup();
            render(
                <NextIntlClientProvider
                    locale="en"
                    messages={messages}
                >
                    <StatsCarousel
                        globalStats={globalStats}
                        total={total}
                        selectedMediaType={selectedMediaType}
                        getTypeDisplayName={getTypeDisplayName}
                    />
                </NextIntlClientProvider>
            );

            const nextButton = screen.getByRole('button', { name: /next/i });
            nextButton.focus();

            // Initially showing first slide with 4.5
            expect(screen.getByText('4.5')).toBeInTheDocument();

            // Press Space to go to next slide
            await user.keyboard(' ');
            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('makes indicator dots keyboard accessible', async () => {
            const user = userEvent.setup();
            render(
                <NextIntlClientProvider
                    locale="en"
                    messages={messages}
                >
                    <StatsCarousel
                        globalStats={globalStats}
                        total={total}
                        selectedMediaType={selectedMediaType}
                        getTypeDisplayName={getTypeDisplayName}
                    />
                </NextIntlClientProvider>
            );

            const indicators = screen.getAllByRole('tab');
            expect(indicators).toHaveLength(3);

            // Tab to first indicator
            indicators[0].focus();
            expect(indicators[0]).toHaveFocus();

            // Activate second indicator using Enter
            indicators[1].focus();
            await user.keyboard('{Enter}');
            expect(screen.getByText('100')).toBeInTheDocument();

            // Verify aria-selected attribute
            expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
            expect(indicators[0]).toHaveAttribute('aria-selected', 'false');
        });

        it('has proper tablist role for indicator navigation', () => {
            render(
                <NextIntlClientProvider
                    locale="en"
                    messages={messages}
                >
                    <StatsCarousel
                        globalStats={globalStats}
                        total={total}
                        selectedMediaType={selectedMediaType}
                        getTypeDisplayName={getTypeDisplayName}
                    />
                </NextIntlClientProvider>
            );

            const tablist = screen.getByRole('tablist', {
                name: /slide navigation/i,
            });
            expect(tablist).toBeInTheDocument();
            expect(tablist).toHaveAttribute('aria-label', 'Slide navigation');
        });

        it('updates aria-selected on indicator dots when slide changes', () => {
            render(
                <NextIntlClientProvider
                    locale="en"
                    messages={messages}
                >
                    <StatsCarousel
                        globalStats={globalStats}
                        total={total}
                        selectedMediaType={selectedMediaType}
                        getTypeDisplayName={getTypeDisplayName}
                    />
                </NextIntlClientProvider>
            );

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

        it('announces content changes to screen readers via aria-live', () => {
            render(
                <NextIntlClientProvider
                    locale="en"
                    messages={messages}
                >
                    <StatsCarousel
                        globalStats={globalStats}
                        total={total}
                        selectedMediaType={selectedMediaType}
                        getTypeDisplayName={getTypeDisplayName}
                    />
                </NextIntlClientProvider>
            );

            const carouselRegion = screen.getByRole('region', {
                name: /statistics carousel/i,
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
            expect(carouselRegion).toHaveTextContent('100');
        });
    });
});
