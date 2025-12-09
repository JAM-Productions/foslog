'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/button/button';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { X, LoaderCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { RatingInput } from '@/components/input/rating';
import Image from 'next/image';

interface Review {
    stars?: number;
    liked?: boolean;
    text: string;
}

export default function EditReviewModal() {
    const tCTA = useTranslations('CTA');
    const tReviewModal = useTranslations('ReviewModal');
    const tMediaPage = useTranslations('MediaPage');

    const { isEditReviewModalOpen, setIsEditReviewModalOpen, editReviewData } =
        useAppStore();

    const [reviewStars, setReviewStars] = useState<number>(0);
    const [reviewLiked, setReviewLiked] = useState<boolean | null>(null);
    const [reviewText, setReviewText] = useState<string>('');
    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editReviewData) {
            setReviewStars(editReviewData.rating || 0);
            setReviewLiked(editReviewData.liked);
            setReviewText(editReviewData.review || '');
        }
    }, [editReviewData]);

    useBodyScrollLock(isEditReviewModalOpen);

    const clearModalState = useCallback(() => {
        setReviewStars(0);
        setReviewLiked(null);
        setReviewText('');
        setError(null);
    }, []);

    const closeModal = useCallback(() => {
        clearModalState();
        setIsEditReviewModalOpen(false);
    }, [clearModalState, setIsEditReviewModalOpen]);

    const submitReview = async () => {
        try {
            setIsLoadingSubmit(true);
            setError(null);
            const review: Review = {
                stars: reviewStars > 0 ? reviewStars : undefined,
                liked: reviewLiked !== null ? reviewLiked : undefined,
                text: reviewText,
            };
            const responseReview = await fetch(
                `/api/review/${editReviewData?.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        review,
                    }),
                }
            );

            if (responseReview.ok) {
                closeModal();
            } else {
                const errorData = await responseReview.json();
                setError(errorData.error);
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred'
            );
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    if (isEditReviewModalOpen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 sm:p-5">
                <div
                    className="bg-muted flex h-screen w-full max-w-4xl flex-col p-5 sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:border"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="mt-10 w-full shrink-0 space-y-2 pb-2 text-center sm:mt-0 sm:pb-0">
                        <div className="flex w-full flex-col justify-center sm:relative sm:flex-row">
                            <Button
                                disabled={isLoadingSubmit}
                                className="absolute top-4 right-4 cursor-pointer sm:top-0 sm:right-0"
                                variant="ghost"
                                size="sm"
                                onClick={() => closeModal()}
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <h2
                                id="modal-title"
                                className="text-2xl font-bold"
                            >
                                {tReviewModal('editReviewModalTitle')}
                            </h2>
                        </div>
                        <p className="text-muted-foreground text-center">
                            {tReviewModal('editReviewModalDescription')}
                        </p>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col items-center gap-4 px-1 py-4 sm:gap-8 sm:py-8">
                        <div className="flex w-full flex-col items-center gap-6 overflow-y-auto px-1 pb-1 sm:flex-row">
                            {editReviewData?.media.posterPath ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500${editReviewData.media.posterPath}`}
                                    alt={editReviewData.media.title}
                                    width={200}
                                    height={300}
                                    className="h-[300px] w-[200px] min-w-[200px] rounded-md object-cover"
                                />
                            ) : (
                                <div className="bg-background flex h-[300px] w-[200px] min-w-[200px] items-center justify-center rounded-md text-center text-sm">
                                    {tReviewModal('noImageAvailable')}
                                </div>
                            )}
                            <form className="w-full space-y-4 sm:space-y-6">
                                <fieldset>
                                    <legend className="text-foreground mb-2 block text-sm font-semibold">
                                        {tMediaPage('yourRating')}
                                    </legend>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                            <RatingInput
                                                size="lg"
                                                onChange={(newRating) => {
                                                    setReviewStars(newRating);
                                                    if (newRating > 0) {
                                                        setReviewLiked(null);
                                                    }
                                                }}
                                                value={reviewStars}
                                            />
                                            <span className="text-muted-foreground text-sm font-medium uppercase">
                                                {tMediaPage('or')}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant={
                                                        reviewLiked === true
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() => {
                                                        setReviewLiked(true);
                                                        setReviewStars(0);
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                    <span className="hidden sm:inline">
                                                        {tMediaPage('like')}
                                                    </span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={
                                                        reviewLiked === false
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() => {
                                                        setReviewLiked(false);
                                                        setReviewStars(0);
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <ThumbsDown className="h-4 w-4" />
                                                    <span className="hidden sm:inline">
                                                        {tMediaPage('dislike')}
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                                <div>
                                    <label
                                        htmlFor="comment"
                                        className="text-foreground mb-2 block text-sm font-semibold"
                                    >
                                        {tMediaPage('yourReview')}
                                    </label>
                                    <textarea
                                        id="comment"
                                        placeholder={tMediaPage(
                                            'shareThoughts'
                                        )}
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-24 w-full resize-none rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-48"
                                        value={reviewText}
                                        onChange={(e) =>
                                            setReviewText(e.target.value)
                                        }
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="flex w-full shrink-0 flex-col items-center justify-center pt-4 sm:pt-0">
                        {error && (
                            <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-center text-sm text-red-700 sm:w-auto">
                                {error}
                            </div>
                        )}
                        <div className="flex w-full gap-4 sm:w-auto">
                            <div className="relative flex w-full flex-row items-center justify-center sm:w-auto">
                                <Button
                                    disabled={
                                        (reviewStars < 1 &&
                                            reviewLiked === null) ||
                                        isLoadingSubmit
                                    }
                                    onClick={() => submitReview()}
                                    className={`w-full cursor-pointer ${
                                        isLoadingSubmit
                                            ? 'text-transparent'
                                            : ''
                                    }`}
                                >
                                    {tCTA('save')}
                                </Button>
                                {isLoadingSubmit && (
                                    <LoaderCircle className="text-primary absolute animate-spin" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
