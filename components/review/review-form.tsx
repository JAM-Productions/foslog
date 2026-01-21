'use client';

import { Button } from '@/components/button/button';
import { RatingInput } from '@/components/input/rating';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { LoaderCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useToastStore } from '@/lib/toast-store';
import { SafeReviewWithMedia } from '@/lib/types';
import { Checkbox } from '@/components/input/checkbox';
import { useRouter } from '@/i18n/navigation';
interface EditProps {
    review: SafeReviewWithMedia;
    setIsEditingReview: (editing: boolean) => void;
}
interface ReviewFormProps {
    mediaId: string;
    mediaType: string;
    hasReviewed?: boolean;
    editProps?: EditProps;
}

export function ReviewForm({
    mediaId,
    mediaType,
    hasReviewed = false,
    editProps,
}: ReviewFormProps) {
    const t = useTranslations('MediaPage');
    const tConsumed = useTranslations('ConsumedMoreThanOnce');
    const tToast = useTranslations('Toast');
    const tCTA = useTranslations('CTA');
    const router = useRouter();

    const [rating, setRating] = useState(editProps?.review.rating ?? 0);
    const [liked, setLiked] = useState<boolean | null>(
        editProps?.review.liked ?? null
    );
    const [text, setText] = useState(editProps?.review.review ?? '');
    const [consumedMoreThanOnce, setConsumedMoreThanOnce] =
        useState(hasReviewed);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { showToast } = useToastStore();

    const hasNotBeenEdited = editProps
        ? rating === (editProps.review.rating ?? 0) &&
          liked === (editProps.review.liked ?? null) &&
          text.trim() === (editProps.review.review ?? '').trim()
        : false;

    const handleSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!user) {
            router.push('/login');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mediaId,
                    review: {
                        stars: rating > 0 ? rating : undefined,
                        liked: liked !== null ? liked : undefined,
                        text: text.trim(),
                        consumedMoreThanOnce: consumedMoreThanOnce,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            // Reset form
            setRating(0);
            setLiked(null);
            setText('');
            setConsumedMoreThanOnce(false);

            showToast(tToast('reviewSubmitted'), 'success');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            showToast(tToast('reviewFailed'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitPatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editProps) return;
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review: {
                        stars: rating > 0 ? rating : undefined,
                        liked: liked !== null ? liked : undefined,
                        text: text.trim(),
                    },
                    reviewId: editProps.review.id,
                }),
            });

            if (response.ok) {
                showToast(tToast('reviewUpdated'), 'success');
                router.refresh();
                editProps.setIsEditingReview(false);
            } else {
                showToast(tToast('reviewUpdateFailed'), 'error');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            showToast(tToast('reviewUpdateFailed'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="space-y-4 sm:space-y-6"
            onSubmit={editProps ? handleSubmitPatch : handleSubmitPost}
        >
            <fieldset>
                <legend className="text-foreground mb-2 block text-xs font-semibold sm:text-sm">
                    {t('yourRating')}
                </legend>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <RatingInput
                        size="lg"
                        value={rating}
                        readonly={isSubmitting}
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
            {!editProps && (
                <Checkbox
                    label={tConsumed(
                        ['film', 'serie', 'book', 'game', 'music'].includes(
                            mediaType.toLowerCase()
                        )
                            ? mediaType.toLowerCase()
                            : 'default'
                    )}
                    checked={consumedMoreThanOnce}
                    onCheckedChange={(checked) => {
                        setConsumedMoreThanOnce(checked);
                    }}
                    disabled={isSubmitting || hasReviewed}
                />
            )}
            {error && (
                <p
                    className="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
                {editProps && (
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full cursor-pointer sm:w-auto"
                        onClick={() => editProps.setIsEditingReview(false)}
                        disabled={isSubmitting}
                    >
                        {tCTA('cancel')}
                    </Button>
                )}
                <div className="relative flex w-full flex-row items-center sm:w-auto">
                    <Button
                        type="submit"
                        className={`w-full cursor-pointer sm:w-auto ${
                            isSubmitting ? 'text-transparent' : ''
                        }`}
                        disabled={
                            isSubmitting ||
                            (rating === 0 && liked === null) ||
                            hasNotBeenEdited
                        }
                    >
                        {!editProps ? t('submitReview') : t('updateReview')}
                    </Button>
                    {isSubmitting && (
                        <LoaderCircle className="text-primary absolute left-1/2 -translate-x-1/2 animate-spin sm:left-[3.5rem] sm:-translate-x-1/12" />
                    )}
                </div>
            </div>
        </form>
    );
}
