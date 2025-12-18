'use client';

import { Button } from '@/components/button/button';
import { RatingInput } from '@/components/input/rating';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { SafeReview } from '@/lib/types';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ReviewFormProps {
    mediaId: string;
    reviewData?: SafeReview;
    onSuccess?: () => void;
}

export function ReviewForm({
    mediaId,
    reviewData,
    onSuccess,
}: ReviewFormProps) {
    const t = useTranslations('MediaPage');
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [liked, setLiked] = useState<boolean | null>(null);
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const isEditMode = !!reviewData;

    useEffect(() => {
        if (isEditMode) {
            setRating(reviewData.rating || 0);
            setLiked(reviewData.liked !== undefined ? reviewData.liked : null);
            setText(reviewData.review || '');
        }
    }, [isEditMode, reviewData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!user) {
            router.push('/login');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/review', {
                method: isEditMode ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mediaId,
                    reviewId: isEditMode ? reviewData.id : undefined,
                    review: {
                        stars: rating > 0 ? rating : null,
                        liked: liked !== null ? liked : null,
                        text: text.trim(),
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            toast.success(
                isEditMode ? t('reviewUpdated') : t('reviewSubmitted')
            );

            if (onSuccess) {
                onSuccess();
            } else {
                setRating(0);
                setLiked(null);
                setText('');
            }

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="space-y-4 sm:space-y-6"
            onSubmit={handleSubmit}
        >
            <fieldset>
                <legend className="text-foreground mb-2 block text-xs font-semibold sm:text-sm">
                    {t('yourRating')}
                </legend>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <RatingInput
                        size="lg"
                        value={rating}
                        onChange={(newRating) => {
                            setRating(newRating);
                            if (newRating > 0) {
                                setLiked(null);
                            }
                        }}
                    />
                    <span className="text-muted-foreground text-sm font-medium uppercase">
                        {t('or')}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={liked === true ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setLiked(true);
                                setRating(0);
                            }}
                            className="flex items-center gap-2"
                        >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {t('like')}
                            </span>
                        </Button>
                        <Button
                            type="button"
                            variant={liked === false ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setLiked(false);
                                setRating(0);
                            }}
                            className="flex items-center gap-2"
                        >
                            <ThumbsDown className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {t('dislike')}
                            </span>
                        </Button>
                    </div>
                </div>
            </fieldset>
            <div>
                <label
                    htmlFor="comment"
                    className="text-foreground mb-2 block text-xs font-semibold sm:text-sm"
                >
                    {t('yourReview')}
                </label>
                <textarea
                    id="comment"
                    placeholder={t('shareThoughts')}
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                    disabled={isSubmitting}
                />
            </div>
            {error && (
                <p
                    className="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}
            <div className="relative flex w-full flex-row items-center sm:w-auto">
                <Button
                    type="submit"
                    className={`w-full cursor-pointer sm:w-auto ${
                        isSubmitting ? 'text-transparent' : ''
                    }`}
                    disabled={isSubmitting || (rating === 0 && liked === null)}
                >
                    {t('submitReview')}
                </Button>
                {isSubmitting && (
                    <LoaderCircle className="text-primary absolute left-1/2 -translate-x-1/2 animate-spin sm:left-[3.5rem] sm:-translate-x-1/12" />
                )}
            </div>
        </form>
    );
}
