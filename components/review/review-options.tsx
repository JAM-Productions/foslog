'use client';

import { Button } from '@/components/button/button';
import { Pencil, Share2, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppStore } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';

interface ReviewOptionsProps {
    isOwner: boolean;
    variant?: 'mobile' | 'desktop';
    review: SafeReviewWithMedia;
}

export function ReviewOptions({
    isOwner,
    variant = 'mobile',
    review,
}: ReviewOptionsProps) {
    const router = useRouter();
    const tCTA = useTranslations('CTA');
    const t = useTranslations('ReviewPage');
    const { setIsEditReviewModalOpen, setEditReviewData } = useAppStore();

    const [isDeleting, setIsDeleting] = useState(false);

    const isMobile = variant === 'mobile';
    const buttonClassName = isMobile
        ? 'flex w-full items-center gap-1.5 sm:w-auto'
        : 'flex w-full items-center gap-1.5';

    const handleEdit = () => {
        setEditReviewData(review);
        setIsEditReviewModalOpen(true);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/review/${review.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                router.push(`/media/${review.mediaId}`);
            } else {
                console.error('Failed to delete review');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {variant === 'desktop' && (
                <span className="text-foreground text-2xl font-bold sm:text-3xl">
                    {t('options')}
                </span>
            )}
            {isOwner && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className={buttonClassName}
                        onClick={handleEdit}
                        data-testid="edit-review-button"
                    >
                        <Pencil className="h-4 w-4" />
                        <span>{tCTA('edit')}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className={buttonClassName}
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash className="h-4 w-4" />
                        <span>{tCTA('delete')}</span>
                    </Button>
                </>
            )}
            <Button
                variant="outline"
                size="sm"
                className={buttonClassName}
            >
                <Share2 className="h-4 w-4" />
                <span>{tCTA('share')}</span>
            </Button>
        </>
    );
}
