import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
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
});
