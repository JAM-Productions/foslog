'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/button/button';
import { useTranslations } from 'next-intl';
import Select, { SelectOption } from '@/components/input/select';
import { useState, useCallback } from 'react';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { X, LoaderCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { RatingInput } from '@/components/input/rating';
import Image from 'next/image';
import { SearchInput, Suggestion } from '@/components/input/search-input';
import { useRouter } from '@/i18n/navigation';
import Modal from './modal';
import { Checkbox } from '@/components/input/checkbox';

interface Review {
    stars?: number;
    liked?: boolean;
    text: string;
    consumedMoreThanOnce?: boolean;
}

export default function ReviewModal() {
    const router = useRouter();

    const tCTA = useTranslations('CTA');
    const tReviewModal = useTranslations('ReviewModal');
    const tMediaTypes = useTranslations('MediaTypes');
    const tMediaPage = useTranslations('MediaPage');
    const tConsumed = useTranslations('ConsumedMoreThanOnce');
    const tBackButton = useTranslations('BackButton');

    const { isReviewModalOpen, setIsReviewModalOpen } = useAppStore();

    const [modalStep, setModalStep] = useState<number>(1);

    const [selectedMediaType, setSelectedMediaType] = useState<string>('');
    const [selectedMedia, setSelectedMedia] = useState<Suggestion | null>(null);

    const [mediaTitle, setMediaTitle] = useState<string>('');

    const [reviewStars, setReviewStars] = useState<number>(0);
    const [reviewLiked, setReviewLiked] = useState<boolean | null>(null);
    const [reviewText, setReviewText] = useState<string>('');
    const [consumedMoreThanOnce, setConsumedMoreThanOnce] =
        useState<boolean>(false);
    const [hasReviewed, setHasReviewed] = useState<boolean>(false);

    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
    const [mediaId, setMediaId] = useState<string | null>(null);
    const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);

    const options: SelectOption[] = [
        { value: 'film', label: tMediaTypes('films'), disabled: false },
        { value: 'serie', label: tMediaTypes('series'), disabled: false },
        { value: 'game', label: tMediaTypes('games'), disabled: false },
        { value: 'book', label: tMediaTypes('books'), disabled: false },
        { value: 'music', label: tMediaTypes('music'), disabled: true },
    ];

    useBodyScrollLock(isReviewModalOpen);

    const clearModalState = useCallback(() => {
        setModalStep(1);
        setMediaTitle('');
        setSelectedMediaType('');
        setSelectedMedia(null);
        setMediaId(null);
        setReviewStars(0);
        setReviewLiked(null);

        setReviewText('');
        setConsumedMoreThanOnce(false);
        setHasReviewed(false);
        setError(null);
    }, []);

    const closeModal = useCallback(() => {
        clearModalState();
        setIsReviewModalOpen(false);
    }, [clearModalState, setIsReviewModalOpen]);

    const handleBack = useCallback(() => {
        setError(null);
        setModalStep(1);
        setReviewStars(0);
        setReviewLiked(null);
        setReviewText('');
        // Reset these when going back, although they will be re-checked on Next
        setHasReviewed(false);
        setConsumedMoreThanOnce(false);
    }, []);

    const handleNext = async () => {
        if (!selectedMedia) return;
        setIsLoadingNext(true);
        setError(null);

        try {
            const response = await fetch('/api/media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedMedia,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to check media');
                return;
            }

            const data = await response.json();
            setMediaId(data.media.id);

            if (data.hasReviewed) {
                setHasReviewed(true);
                setConsumedMoreThanOnce(true);
            } else {
                setHasReviewed(false);
                setConsumedMoreThanOnce(false);
            }

            setModalStep(2);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred'
            );
        } finally {
            setIsLoadingNext(false);
        }
    };

    const submitReview = async () => {
        if (!mediaId) {
            setError('Media ID is missing');
            return;
        }

        try {
            setIsLoadingSubmit(true);
            setError(null);

            const review: Review = {
                stars: reviewStars > 0 ? reviewStars : undefined,
                liked: reviewLiked !== null ? reviewLiked : undefined,
                text: reviewText,
                consumedMoreThanOnce,
            };
            const responseReview = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review,
                    mediaId: mediaId,
                }),
            });

            if (responseReview.ok) {
                closeModal();
                router.push(`/media/${mediaId}`);
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

    return (
        <Modal isModalOpen={isReviewModalOpen}>
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
                        {tReviewModal('reviewModalTitle')}
                    </h2>
                </div>
                <p className="text-muted-foreground text-center">
                    {modalStep === 1
                        ? tReviewModal('reviewModalDescription')
                        : tReviewModal('reviewModalDescription2')}
                </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center gap-4 px-1 py-4 sm:gap-8 sm:py-8">
                <div
                    className={`flex w-full shrink-0 flex-col gap-4 sm:flex-row ${modalStep === 1 ? 'block' : 'hidden'}`}
                >
                    <Select
                        options={options}
                        value={selectedMediaType}
                        onChange={setSelectedMediaType}
                        placeholder={tReviewModal('selectMediaType')}
                    />
                    <div className="flex-8">
                        <SearchInput
                            disabled={!selectedMediaType}
                            placeholder={tReviewModal('inputMediaTitle')}
                            selectedMediaType={selectedMediaType}
                            setSelectedMedia={setSelectedMedia}
                            setMediaTitle={setMediaTitle}
                            value={mediaTitle}
                            onChange={(e) => setMediaTitle(e.target.value)}
                        />
                    </div>
                </div>

                {modalStep === 2 && (
                    <div className="flex w-full flex-col items-center gap-6 overflow-y-auto px-1 pb-1 sm:flex-row">
                        {selectedMedia?.poster ? (
                            <Image
                                src={selectedMedia.poster}
                                alt={selectedMedia.title}
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
                                    placeholder={tMediaPage('shareThoughts')}
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-24 w-full resize-none rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-48"
                                    value={reviewText}
                                    onChange={(e) =>
                                        setReviewText(e.target.value)
                                    }
                                />
                            </div>
                            <Checkbox
                                label={tConsumed(
                                    [
                                        'film',
                                        'serie',
                                        'book',
                                        'game',
                                        'music',
                                    ].includes(selectedMediaType.toLowerCase())
                                        ? selectedMediaType.toLowerCase()
                                        : 'default'
                                )}
                                checked={consumedMoreThanOnce}
                                onCheckedChange={setConsumedMoreThanOnce}
                                disabled={
                                    isLoadingSubmit ||
                                    (hasReviewed && consumedMoreThanOnce)
                                }
                            />
                        </form>
                    </div>
                )}
            </div>

            <div className="flex w-full shrink-0 flex-col items-center justify-center pt-4 sm:pt-0">
                {error && modalStep === 2 && (
                    <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-center text-sm text-red-700 sm:w-auto">
                        {error}
                    </div>
                )}
                <div className="flex w-full gap-4 sm:w-auto">
                    {modalStep === 1 && (
                        <div className="relative w-full sm:w-auto">
                            <Button
                                disabled={!selectedMedia || isLoadingNext}
                                className={`w-full cursor-pointer sm:w-auto ${isLoadingNext ? 'text-transparent' : ''}`}
                                onClick={handleNext}
                            >
                                {tCTA('next')}
                            </Button>
                            {isLoadingNext && (
                                <LoaderCircle className="text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                            )}
                        </div>
                    )}
                    {modalStep === 2 && (
                        <div className="flex w-full gap-4">
                            <Button
                                disabled={isLoadingSubmit}
                                className="w-full cursor-pointer"
                                variant="ghost"
                                onClick={() => handleBack()}
                            >
                                {tBackButton('back')}
                            </Button>
                            <div className="relative flex w-full flex-row items-center justify-center sm:w-auto">
                                <Button
                                    disabled={
                                        !selectedMedia ||
                                        (reviewStars < 0.5 &&
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
                                    {tMediaPage('submitReview')}
                                </Button>
                                {isLoadingSubmit && (
                                    <LoaderCircle className="text-primary absolute animate-spin" />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
