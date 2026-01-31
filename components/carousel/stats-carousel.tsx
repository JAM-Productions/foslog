'use client';

import React, { useEffect, useRef, useState } from 'react';
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
    isMobile,
}: {
    globalStats: {
        topRated: number;
        recentlyAdded: number;
    };
    total: number;
    selectedMediaType: string;
    getTypeDisplayName: (type: string) => string;
    isMobile: boolean;
}) {
    const tStats = useTranslations('Stats');
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

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
        setIsTransitioning(true);
        setActiveIndex((prevIndex) =>
            Math.min(prevIndex + 1, statsCards.length - 1)
        );
    };

    const prevSlide = () => {
        setIsTransitioning(true);
        setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setIsTransitioning(false);
        setTouchStart(e.targetTouches[0].clientX);
        setDragOffset(0);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStart || !containerRef.current) return;

        const currentTouch = e.targetTouches[0].clientX;
        const diff = currentTouch - touchStart;
        const containerWidth = containerRef.current.offsetWidth;

        const dragPercentage = (diff / containerWidth) * 100;
        setDragOffset(dragPercentage);
    };

    const onTouchEnd = () => {
        if (!touchStart || !containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const dragDistance = (dragOffset / 100) * containerWidth;
        const threshold = containerWidth * 0.1; // 10% threshold

        if (Math.abs(dragDistance) > threshold) {
            if (dragDistance > 0 && activeIndex > 0) {
                prevSlide();
            } else if (
                dragDistance < 0 &&
                activeIndex < statsCards.length - 1
            ) {
                nextSlide();
            } else {
                setIsTransitioning(true);
            }
        } else {
            setIsTransitioning(true);
        }

        setTouchStart(null);
        setDragOffset(0);
    };

    // Auto-play effect
    useEffect(() => {
        // Pause auto-play while the user is interacting via touch
        if (touchStart !== null) {
            return;
        }
        // Reset timer when activeIndex changes (including after manual swipes)
        const timer = setInterval(() => {
            setActiveIndex((prevIndex) => {
                // Loop back to first slide when at the end
                if (prevIndex >= statsCards.length - 1) {
                    return 0;
                }
                return prevIndex + 1;
            });
            setIsTransitioning(true);
        }, 10000); // 10 seconds
        return () => clearInterval(timer);
    }, [touchStart, activeIndex, statsCards.length]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                {!isMobile && (
                    <Button
                        onClick={prevSlide}
                        aria-label="previous"
                        size="sm"
                        variant="ghost"
                        disabled={activeIndex === 0}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}
                <div
                    ref={containerRef}
                    id="stats-carousel"
                    className="bg-card relative w-full overflow-hidden rounded-lg border"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div
                        className={`flex ${isTransitioning ? 'transition-transform duration-300 ease-in-out' : ''}`}
                        style={{
                            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}%))`,
                        }}
                    >
                        {statsCards.map((card, index) => {
                            const CardIcon = card.icon;
                            const isActive = index === activeIndex;

                            return (
                                <div
                                    key={`card-${index}`}
                                    className="w-full flex-shrink-0 p-4"
                                    aria-live={isActive ? 'polite' : 'off'}
                                    aria-atomic="true"
                                    role="region"
                                    aria-label={`Statistics carousel - ${card.title}`}
                                    aria-hidden={!isActive}
                                >
                                    <div className="text-primary mb-2 flex items-center gap-2">
                                        <CardIcon className="h-4 w-4" />
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
                            );
                        })}
                    </div>
                </div>
                {!isMobile && (
                    <Button
                        onClick={nextSlide}
                        aria-label="next"
                        size="sm"
                        variant="ghost"
                        disabled={activeIndex === statsCards.length - 1}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Slide indicators */}
            <div
                className="flex justify-center gap-2"
                role="tablist"
                aria-label="Slide navigation"
            >
                {statsCards.map((_, index) => {
                    return (
                        <button
                            key={index}
                            onClick={() => {
                                setIsTransitioning(true);
                                setActiveIndex(index);
                            }}
                            className={`h-2 w-2 cursor-pointer rounded-full transition-all ${
                                index === activeIndex
                                    ? 'bg-primary'
                                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-selected={index === activeIndex}
                            aria-controls="stats-carousel"
                            role="tab"
                        />
                    );
                })}
            </div>
        </div>
    );
}
