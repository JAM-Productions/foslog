'use client';

import { useAppStore } from '@/lib/store';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';
import Select, { SelectOption } from './ui/select';
import { useState, useCallback } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { X, LoaderCircle } from 'lucide-react';
import { RatingInput } from './ui/rating';
import Image from 'next/image';
import { SearchInput, Suggestion } from './ui/search-input';

interface Review {
    stars: number;
    text: string;
}

export default function ReviewModal() {
    const tCTA = useTranslations('CTA');
    const tReviewModal = useTranslations('ReviewModal');
    const tMediaTypes = useTranslations('MediaTypes');
    const tMediaPage = useTranslations('MediaPage');
    const tBackButton = useTranslations('BackButton');

    const { isReviewModalOpen, setIsReviewModalOpen } = useAppStore();

    const [modalStep, setModalStep] = useState<number>(1);

    const [selectedMediaType, setSelectedMediaType] = useState<string>('');
    const [selectedMedia, setSelectedMedia] = useState<Suggestion | null>(null);

    const [mediaTitle, setMediaTitle] = useState<string>('');

    const [reviewStars, setReviewStars] = useState<number>(0);
    const [reviewText, setReviewText] = useState<string>('');

    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

    const options: SelectOption[] = [
        { value: 'film', label: tMediaTypes('films'), disabled: false },
        { value: 'serie', label: tMediaTypes('series'), disabled: true },
        { value: 'game', label: tMediaTypes('games'), disabled: true },
        { value: 'book', label: tMediaTypes('books'), disabled: true },
        { value: 'music', label: tMediaTypes('music'), disabled: true },
    ];

    useBodyScrollLock(isReviewModalOpen);

    const clearModalState = useCallback(() => {
        setModalStep(1);
        setMediaTitle('');
        setSelectedMediaType('');
        setSelectedMedia(null);
        setReviewStars(0);
        setReviewText('');
    }, []);

    const closeModal = useCallback(() => {
        clearModalState();
        setIsReviewModalOpen(false);
    }, [clearModalState, setIsReviewModalOpen]);

    const handleBack = useCallback(() => {
        setModalStep(1);
        setReviewStars(0);
        setReviewText('');
    }, []);

    const submitReview = async () => {
        try {
            setIsLoadingSubmit(true);
            const responseMedia = await fetch('/api/media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedMedia,
                }),
            });

            if (!responseMedia.ok) {
                console.error('Failed to create media');
                return;
            }

            const data = await responseMedia.json();
            const review: Review = {
                stars: reviewStars,
                text: reviewText,
            };
            const responseReview = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review,
                    mediaId: data.media.id,
                }),
            });

            if (responseReview.ok) {
                closeModal();
            } else {
                console.error('Failed to create review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    if (isReviewModalOpen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 sm:p-5">
                <div
                    className="bg-muted flex h-screen w-full max-w-4xl flex-col items-center justify-between gap-8 p-5 sm:h-auto sm:justify-center sm:rounded-lg sm:border"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="flex w-full flex-col items-center gap-4 sm:gap-8">
                        <div className="mt-10 w-full space-y-2 text-center sm:mt-0">
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

                        <div
                            className={`flex w-full flex-col gap-4 sm:flex-row ${modalStep === 1 ? 'block' : 'hidden'}`}
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
                                    placeholder={tReviewModal(
                                        'inputMediaTitle'
                                    )}
                                    selectedMediaType={selectedMediaType}
                                    setSelectedMedia={setSelectedMedia}
                                    setMediaTitle={setMediaTitle}
                                    value={mediaTitle}
                                    onChange={(e) =>
                                        setMediaTitle(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {modalStep === 2 && (
                            <div className="flex w-full flex-col items-center gap-6 sm:flex-row">
                                {selectedMedia?.poster ? (
                                    <Image
                                        src={selectedMedia.poster}
                                        alt={selectedMedia.title}
                                        width={200}
                                        height={300}
                                        className="rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="bg-background flex h-[300px] w-[200px] items-center justify-center rounded-md text-center text-sm">
                                        {tReviewModal('noImageAvailable')}
                                    </div>
                                )}
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
                                            rows={4}
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            value={reviewText}
                                            onChange={(e) =>
                                                setReviewText(e.target.value)
                                            }
                                        />
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex w-full flex-col gap-4 sm:mt-0 sm:w-auto sm:flex-row">
                        {modalStep === 1 && (
                            <Button
                                disabled={!selectedMedia}
                                className="h-12 w-full cursor-pointer text-lg sm:w-auto sm:text-base"
                                onClick={() => setModalStep(2)}
                            >
                                {tCTA('next')}
                            </Button>
                        )}
                        {modalStep === 2 && (
                            <>
                                <Button
                                    disabled={isLoadingSubmit}
                                    className="h-12 w-full cursor-pointer text-lg sm:w-auto sm:text-base"
                                    variant="ghost"
                                    onClick={() => handleBack()}
                                >
                                    {tBackButton('back')}
                                </Button>
                                <div className="relative flex w-full flex-row items-center justify-center sm:w-auto">
                                    <Button
                                        disabled={
                                            !selectedMedia ||
                                            reviewStars < 1 ||
                                            !reviewText.trim() ||
                                            isLoadingSubmit
                                        }
                                        onClick={() => submitReview()}
                                        className={`cursor-pointer ${
                                            isLoadingSubmit
                                                ? 'text-transparent'
                                                : ''
                                        } h-12 w-full text-lg sm:w-auto sm:text-base`}
                                    >
                                        {tMediaPage('submitReview')}
                                    </Button>
                                    {isLoadingSubmit && (
                                        <LoaderCircle className="text-primary absolute animate-spin" />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
