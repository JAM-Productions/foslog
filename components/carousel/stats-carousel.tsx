'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import {
    TrendingUp,
    Clock,
    Star,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../button/button';

export default function StatsCarousel({
    globalStats,
    total,
    selectedMediaType,
    getTypeDisplayName,
}: {
    globalStats: {
        topRated: number;
        recentlyAdded: number;
    };
    total: number;
    selectedMediaType: string;
    getTypeDisplayName: (type: string) => string;
}) {
    const tStats = useTranslations('Stats');
    const [activeIndex, setActiveIndex] = useState(0);

    const statsCards = [
        {
            icon: Star,
            title: tStats('topRated'),
            value: globalStats.topRated.toFixed(1),
            description: tStats('highestRatedInCollection'),
        },
        {
            icon: TrendingUp,
            title: tStats('totalItems'),
            value: total.toString(),
            description:
                selectedMediaType === 'all'
                    ? tStats('allMediaTypes')
                    : getTypeDisplayName(selectedMediaType),
        },
        {
            icon: Clock,
            title: tStats('recentlyAdded'),
            value: globalStats.recentlyAdded.toString(),
            description: tStats('fromLastMonth'),
        },
    ];

    const nextSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % statsCards.length);
    };

    const prevSlide = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === 0 ? statsCards.length - 1 : prevIndex - 1
        );
    };

    const Icon = statsCards[activeIndex].icon;

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(
            () =>
                setActiveIndex(
                    (prevIndex) => (prevIndex + 1) % statsCards.length
                ),
            5000
        );

        return () => {
            resetTimeout();
        };
    }, [activeIndex, statsCards.length]);

    const bind = useDrag(
        ({ down, movement: [mx], last }) => {
            if (last) {
                if (mx > 50) {
                    prevSlide();
                } else if (mx < -50) {
                    nextSlide();
                }
            }
        },
        { axis: 'x' }
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <Button
                    onClick={prevSlide}
                    aria-label="previous"
                    size="sm"
                    variant="ghost"
                    className="hidden md:inline-flex"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div
                    {...bind()}
                    id="stats-carousel-content"
                    className="w-full overflow-x-hidden"
                    aria-live="polite"
                    aria-atomic="true"
                    role="region"
                    aria-label="Statistics carousel"
                >
                    <div
                        className="flex transition-transform duration-300"
                        style={{
                            transform: `translateX(-${activeIndex * 100}%)`,
                        }}
                    >
                        {statsCards.map((card, index) => (
                            <div
                                key={index}
                                className="bg-card w-full flex-shrink-0 rounded-lg border p-4"
                            >
                                <div className="text-primary mb-2 flex items-center gap-2">
                                    <card.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {card.title}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {card.value}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={nextSlide}
                    aria-label="next"
                    size="sm"
                    variant="ghost"
                    className="hidden md:inline-flex"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Slide indicators */}
            <div
                className="flex justify-center gap-2"
                role="tablist"
                aria-label="Slide navigation"
            >
                {statsCards.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`h-2 w-2 cursor-pointer rounded-full transition-all ${
                            index === activeIndex
                                ? 'bg-primary'
                                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-selected={index === activeIndex}
                        aria-controls="stats-carousel-content"
                        role="tab"
                    />
                ))}
            </div>
        </div>
    );
}
