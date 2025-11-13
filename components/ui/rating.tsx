'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

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

    const handleStarClick = (rating: number) => {
        if (!readonly && onChange) {
            onChange(rating);
        }
    };

    const handleStarHover = (rating: number) => {
        if (!readonly) {
            setHoverRating(rating);
            setIsHovering(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setHoverRating(0);
    };

    return (
        <div
            id={id}
            aria-labelledby={ariaLabelledby}
            className={`flex items-center gap-1${className ? ` ${className}` : ''}`}
        >
            <div
                className="flex items-center"
                onMouseLeave={handleMouseLeave}
            >
                {Array.from({ length: 5 }, (_, i) => {
                    const starValue = i + 1;
                    const isFilled = starValue <= currentRating;

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleStarClick(starValue)}
                            onMouseEnter={() => handleStarHover(starValue)}
                            disabled={readonly}
                            className={[
                                'focus:ring-ring rounded transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
                                !readonly &&
                                    'transform transition-transform hover:scale-110',
                                readonly && 'cursor-default',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <Star
                                className={[
                                    sizeClasses[size],
                                    'transition-colors',
                                    isFilled
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-muted-foreground hover:text-amber-400',
                                    !readonly && 'hover:text-amber-400',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            />
                        </button>
                    );
                })}
            </div>

            {showValue && (
                <span className="text-muted-foreground ml-2 text-sm">
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
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
}) {
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
