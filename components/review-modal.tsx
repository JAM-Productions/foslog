'use client';

import { useAppStore } from '@/lib/store';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';
import Select, { SelectOption } from './ui/select';
import { useEffect, useState } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { X } from 'lucide-react';
import { RatingInput } from './ui/rating';
import Image from 'next/image';
import { SearchInput, Suggestion } from './ui/search-input';

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
    const [searchResults, setSearchResults] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const options: SelectOption[] = [
        { value: 'film', label: tMediaTypes('films'), disabled: false },
        { value: 'serie', label: tMediaTypes('series'), disabled: true },
        { value: 'game', label: tMediaTypes('games'), disabled: true },
        { value: 'book', label: tMediaTypes('books'), disabled: true },
        { value: 'music', label: tMediaTypes('music'), disabled: true },
    ];

    useBodyScrollLock(isReviewModalOpen);

    useEffect(() => {
        const isMediaTitleInData = (searchResults: Suggestion[]): boolean => {
            return searchResults.some(
                (result: Suggestion) => result.title === mediaTitle.trim()
            );
        };

        const getMediaInData = (
            searchResults: Suggestion[]
        ): Suggestion | null => {
            const foundMedia = searchResults.find(
                (result: Suggestion) => result.title === mediaTitle.trim()
            );
            return foundMedia || null;
        };

        if (isReviewModalOpen && selectedMediaType) {
            setSearchResults([]);
            const getSearchInputData = setTimeout(async () => {
                setIsLoading(true);
                const response = await fetch(
                    `${window.location.origin}/api/search?mediatype=${encodeURIComponent(selectedMediaType)}&mediatitle=${encodeURIComponent(mediaTitle.trim())}`
                );
                const data = await response.json();
                setSearchResults(data);
                if (isMediaTitleInData(data)) {
                    setSelectedMedia(getMediaInData(data));
                } else {
                    setSelectedMedia(null);
                }
                setIsLoading(false);
            }, 300);

            return () => clearTimeout(getSearchInputData);
        }
    }, [isReviewModalOpen, selectedMediaType, mediaTitle]);

    const clearModalState = () => {
        setModalStep(1);
        setMediaTitle('');
        setSelectedMediaType('');
        setSelectedMedia(null);
        setSearchResults([]);
        setIsLoading(false);
    };

    const closeModal = () => {
        clearModalState();
        setIsReviewModalOpen(false);
    };

    if (isReviewModalOpen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 sm:p-5">
                <div className="bg-muted flex h-screen w-full max-w-4xl flex-col items-center justify-between gap-8 p-5 sm:h-auto sm:justify-center sm:rounded-lg sm:border">
                    <div className="flex w-full flex-col items-center gap-8">
                        <div className="mt-10 w-full space-y-2 text-center sm:mt-0">
                            <div className="flex w-full flex-col justify-center sm:relative sm:flex-row">
                                <Button
                                    className="absolute top-4 right-4 cursor-pointer sm:top-0 sm:right-0"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => closeModal()}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                                <h2 className="text-2xl font-bold">
                                    {tReviewModal('reviewModalTitle')}
                                </h2>
                            </div>
                            <p className="text-muted-foreground text-center">
                                {modalStep === 1
                                    ? tReviewModal('reviewModalDescription')
                                    : tReviewModal('reviewModalDescription2')}
                            </p>
                        </div>
                        {modalStep === 1 && (
                            <div className="flex w-full flex-col gap-4 sm:flex-row">
                                <Select
                                    options={options}
                                    value={selectedMediaType}
                                    onChange={setSelectedMediaType}
                                    placeholder={tReviewModal(
                                        'selectMediaType'
                                    )}
                                />
                                <div className="flex-8">
                                    <SearchInput
                                        disabled={!selectedMediaType}
                                        placeholder={tReviewModal(
                                            'inputMediaTitle'
                                        )}
                                        value={mediaTitle}
                                        onChange={(e) =>
                                            setMediaTitle(e.target.value)
                                        }
                                        suggestions={searchResults}
                                        loading={isLoading}
                                        onSelect={(suggestion) => {
                                            setMediaTitle(suggestion.title);
                                            setSelectedMedia(suggestion);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {modalStep === 2 && (
                            <div className="flex w-full flex-col items-center gap-6 sm:flex-row">
                                <Image
                                    src={selectedMedia?.poster || ''}
                                    alt={selectedMedia?.title || ''}
                                    width={200}
                                    height={300}
                                    className="rounded-md object-cover"
                                />
                                <form className="w-full space-y-4 sm:space-y-6">
                                    <fieldset>
                                        <legend className="text-foreground mb-2 block text-sm font-semibold">
                                            {tMediaPage('yourRating')}
                                        </legend>
                                        <RatingInput size="lg" />
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
                                        />
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        {modalStep === 1 && (
                            <Button
                                disabled={!selectedMedia}
                                className="cursor-pointer"
                                onClick={() => setModalStep(2)}
                            >
                                {tCTA('next')}
                            </Button>
                        )}
                        {modalStep === 2 && (
                            <>
                                <Button
                                    className="cursor-pointer"
                                    variant="ghost"
                                    onClick={() => setModalStep(1)}
                                >
                                    {tBackButton('back')}
                                </Button>
                                <Button className="cursor-pointer">
                                    {tMediaPage('submitReview')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
