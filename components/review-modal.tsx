'use client';

import { useAppStore } from '@/lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTranslations } from 'next-intl';
import Select, { SelectOption } from './ui/select';
import { useState } from 'react';

export default function ReviewModal() {
    const tCTA = useTranslations('CTA');
    const tReviewModal = useTranslations('ReviewModal');
    const tMediaTypes = useTranslations('MediaTypes');

    const { isReviewModalOpen, setIsReviewModalOpen } = useAppStore();

    const [selectedMediaType, setSelectedMediaType] = useState<string>('');
    const [mediaTitle, setMediaTitle] = useState<string>('');

    const options: SelectOption[] = [
        { value: 'film', label: tMediaTypes('films'), disabled: false },
        { value: 'serie', label: tMediaTypes('series'), disabled: true },
        { value: 'game', label: tMediaTypes('games'), disabled: true },
        { value: 'book', label: tMediaTypes('books'), disabled: true },
        { value: 'music', label: tMediaTypes('music'), disabled: true },
    ];

    if (isReviewModalOpen) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
                onClick={() => setIsReviewModalOpen(false)}
            >
                <div
                    className="bg-muted flex w-full max-w-4xl flex-col items-center justify-center gap-10 rounded-lg border p-5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-full space-y-2 text-center">
                        <h2 className="text-2xl font-bold">
                            {tReviewModal('reviewModalTitle')}
                        </h2>
                        <p className="text-muted-foreground text-center">
                            {tReviewModal('reviewModalDescription')}
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-4 sm:flex-row">
                        <div className="">
                            <Select
                                options={options}
                                value={selectedMediaType}
                                onChange={setSelectedMediaType}
                                placeholder={tReviewModal('selectMediaType')}
                            />
                        </div>
                        <div className="flex-8">
                            <Input
                                disabled={!selectedMediaType}
                                placeholder={tReviewModal('inputMediaTitle')}
                                value={mediaTitle}
                                onChange={(e) => setMediaTitle(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        disabled={!selectedMediaType || !mediaTitle}
                        className="cursor-pointer"
                    >
                        {tCTA('next')}
                    </Button>
                </div>
            </div>
        );
    }
}
