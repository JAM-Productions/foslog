'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/button/button';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { X, LoaderCircle } from 'lucide-react';
import { RatingInput } from '@/components/input/rating';
import { updateReview } from '@/app/actions/review';

interface Review {
    stars: number;
    text: string;
}

export default function EditReviewModal() {
    const tCTA = useTranslations('CTA');
    const tReviewModal = useTranslations('ReviewModal');
    const tMediaPage = useTranslations('MediaPage');

    const {
        isEditReviewModalOpen,
        setIsEditReviewModalOpen,
        editReviewData,
    } = useAppStore();

    const [reviewStars, setReviewStars] = useState<number>(0);
    const [reviewText, setReviewText] = useState<string>('');

    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useBodyScrollLock(isEditReviewModalOpen);

    useEffect(() => {
        if (editReviewData) {
            setReviewStars(editReviewData.rating);
            setReviewText(editReviewData.review || '');
        }
    }, [editReviewData]);

    const clearModalState = useCallback(() => {
        setReviewStars(0);
        setReviewText('');
        setError(null);
    }, []);

    const closeModal = useCallback(() => {
        clearModalState();
        setIsEditReviewModalOpen(false);
    }, [clearModalState, setIsEditReviewModalOpen]);

    const submitReview = async () => {
        if (!editReviewData) return;

        try {
            setIsLoadingSubmit(true);
            setError(null);
            const review: Review = {
                stars: reviewStars,
                text: reviewText,
            };
            await updateReview(editReviewData.id, review);
            closeModal();
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
                    className="bg-muted flex h-screen w-full max-w-lg flex-col p-5 sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:border"
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
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col items-center gap-4 px-1 py-4 sm:gap-8 sm:py-8">
                        <form className="w-full space-y-4 sm:space-y-6">
                            <fieldset>
                                <legend className="text-foreground mb-2 block text-sm font-semibold">
                                    {tMediaPage('yourRating')}
                                </legend>
                                <RatingInput
                                    size="lg"
                                    onChange={setReviewStars}
                                    value={reviewStars}
                                />
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

                    <div className="flex w-full shrink-0 flex-col items-center justify-center pt-4 sm:pt-0">
                        {error && (
                            <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-center text-sm text-red-700 sm:w-auto">
                                {error}
                            </div>
                        )}
                        <div className="relative flex w-full flex-row items-center justify-center sm:w-auto">
                            <Button
                                disabled={
                                    reviewStars < 1 ||
                                    isLoadingSubmit
                                }
                                onClick={() => submitReview()}
                                className={`w-full cursor-pointer ${
                                    isLoadingSubmit
                                        ? 'text-transparent'
                                        : ''
                                }`}
                            >
                                {tMediaPage('submitReview')}
                            </Button>
                            {isLoadingSubmit && (
                                <LoaderCircle className="text-primary absolute animate-spin" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
