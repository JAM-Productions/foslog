'use client';

import { Star, StarHalf } from 'lucide-react';

export function StarRating({
    rating,
    size = 'sm',
}: {
    rating: number;
    size?: 'sm' | 'md';
}) {
    const stars = Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;

        return (
            <div
                key={i}
                className="relative"
            >
                <Star
                    className={`text-muted-foreground ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`}
                />
                {filled && (
                    <Star
                        className={`absolute top-0 left-0 fill-amber-400 text-amber-400 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`}
                    />
                )}
                {halfFilled && (
                    <StarHalf
                        className={`absolute top-0 left-0 fill-amber-400 text-amber-400 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`}
                    />
                )}
            </div>
        );
    });

    return <div className="flex items-center gap-0.5">{stars}</div>;
}
