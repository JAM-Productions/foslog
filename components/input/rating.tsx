'use client';

import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingInputProps {
    id?: string;
    'aria-labelledby'?: string;
    value?: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
}

export function RatingInput({
    id,
    'aria-labelledby': ariaLabelledby,
    value = 0,
    onChange,
    readonly = false,
    size = 'md',
    showValue = false,
    className,
}: RatingInputProps) {
    const [hoverRating, setHoverRating] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const currentRating = isHovering ? hoverRating : value;

    const handleMouseMove = (
        e: React.MouseEvent<HTMLButtonElement>,
        index: number
    ) => {
        if (readonly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isHalf = x < rect.width / 2;
        const newRating = index + (isHalf ? 0.5 : 1);
        setHoverRating(newRating);
        setIsHovering(true);
    };

    const handleStarClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        index: number
    ) => {
        if (readonly || !onChange) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isHalf = x < rect.width / 2;
        onChange(index + (isHalf ? 0.5 : 1));
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setHoverRating(0);
    };

    return (
        <div
            id={id}
            aria-labelledby={ariaLabelledby}
            className={`flex items-center gap-1${
                className ? ` ${className}` : ''
            }`}
        >
            <div
                className="flex items-center"
                onMouseLeave={handleMouseLeave}
            >
                {Array.from({ length: 5 }, (_, i) => {
                    const starValue = i + 1;
                    const isFilled = starValue <= currentRating;
                    const isHalfFilled =
                        i === Math.floor(currentRating) &&
                        currentRating % 1 >= 0.5;

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={(e) => handleStarClick(e, i)}
                            onMouseMove={(e) => handleMouseMove(e, i)}
                            disabled={readonly}
                            className={[
                                'rounded transition-colors focus:outline-none',
                                !readonly &&
                                    'transform cursor-pointer transition-transform hover:scale-110',
                                readonly && 'cursor-default',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <div className="relative">
                                <Star
                                    className={[
                                        sizeClasses[size],
                                        'text-muted-foreground transition-colors',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                />
                                {isFilled && (
                                    <Star
                                        className={[
                                            sizeClasses[size],
                                            'absolute top-0 left-0 fill-amber-400 text-amber-400',
                                        ].join(' ')}
                                    />
                                )}
                                {isHalfFilled && (
                                    <StarHalf
                                        className={[
                                            sizeClasses[size],
                                            'absolute top-0 left-0 fill-amber-400 text-amber-400',
                                        ].join(' ')}
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showValue && (
                <span
                    className={`text-muted-foreground ml-2 ${size === 'sm' ? 'text-sm' : 'text-base'}`}
                >
                    {currentRating > 0 ? `${currentRating}/5` : 'No rating'}
                </span>
            )}
        </div>
    );
}

export function RatingDisplay({
    rating,
    size = 'sm',
    showValue = true,
    className,
}: {
    rating?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
}) {
    if (rating === undefined || rating === null || rating === 0) {
        return null;
    }
    return (
        <RatingInput
            value={rating}
            readonly
            size={size}
            showValue={showValue}
            className={className}
        />
    );
}
