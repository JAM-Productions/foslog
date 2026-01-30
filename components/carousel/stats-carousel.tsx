'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    const [isTransitioning, setIsTransitioning] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    const resetAutoAdvance = () => {
        if (autoAdvanceTimerRef.current) {
            clearInterval(autoAdvanceTimerRef.current);
        }
        // Restart the timer
        autoAdvanceTimerRef.current = setInterval(() => {
            setIsTransitioning(true);
            setActiveIndex((prevIndex) => (prevIndex + 1) % statsCards.length);
            setTimeout(() => setIsTransitioning(false), 300);
        }, 5000);
    };

    const nextSlide = () => {
        setIsTransitioning(true);
        setActiveIndex((prevIndex) => (prevIndex + 1) % statsCards.length);
        setTimeout(() => setIsTransitioning(false), 300);
        resetAutoAdvance();
    };

    const prevSlide = () => {
        setIsTransitioning(true);
        setActiveIndex((prevIndex) =>
            prevIndex === 0 ? statsCards.length - 1 : prevIndex - 1
        );
        setTimeout(() => setIsTransitioning(false), 300);
        resetAutoAdvance();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        resetAutoAdvance();
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const swipeThreshold = 50;
        const diff = touchStartX.current - touchEndX.current;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }

        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    useEffect(() => {
        const currentCarouselRef = carouselRef.current;

        const autoAdvance = () => {
            setIsTransitioning(true);
            setActiveIndex((prevIndex) => (prevIndex + 1) % statsCards.length);
            setTimeout(() => setIsTransitioning(false), 300);
        };

        const startTimer = () => {
            if (autoAdvanceTimerRef.current) {
                clearInterval(autoAdvanceTimerRef.current);
            }
            autoAdvanceTimerRef.current = setInterval(autoAdvance, 5000);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startTimer();
                    } else {
                        if (autoAdvanceTimerRef.current) {
                            clearInterval(autoAdvanceTimerRef.current);
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (currentCarouselRef) {
            observer.observe(currentCarouselRef);
        }

        return () => {
            if (autoAdvanceTimerRef.current) {
                clearInterval(autoAdvanceTimerRef.current);
            }
            if (currentCarouselRef) {
                observer.unobserve(currentCarouselRef);
            }
        };
    }, [statsCards.length]);

    const Icon = statsCards[activeIndex].icon;

    return (
        <div className="flex flex-col gap-3" ref={carouselRef}>
            <div className="flex items-center justify-between gap-2">
                <Button
                    onClick={prevSlide}
                    aria-label="previous"
                    size="sm"
                    variant="ghost"
                    className="hidden md:flex"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div
                    id="stats-carousel-content"
                    className="bg-card w-full rounded-lg border p-4 touch-pan-y select-none transition-opacity duration-300"
                    aria-live="polite"
                    aria-atomic="true"
                    role="region"
                    aria-label="Statistics carousel"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        opacity: isTransitioning ? 0 : 1,
                    }}
                >
                    <div className="text-primary mb-2 flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {statsCards[activeIndex].title}
                        </span>
                    </div>
                    <p className="text-2xl font-bold">
                        {statsCards[activeIndex].value}
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {statsCards[activeIndex].description}
                    </p>
                </div>

                <Button
                    onClick={nextSlide}
                    aria-label="next"
                    size="sm"
                    variant="ghost"
                    className="hidden md:flex"
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
                        onClick={() => {
                            setActiveIndex(index);
                            resetAutoAdvance();
                        }}
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
