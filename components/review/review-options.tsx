'use client';

import { Button } from '@/components/button/button';
import { deleteReview } from '@/app/actions/review';
import { Pencil, Share2, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { SafeReviewWithMedia } from '@/lib/types';
import { useAppStore } from '@/lib/store';

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
    const tConfirmation = useTranslations('Confirmation');

    const { setIsEditReviewModalOpen, setEditReviewData } = useAppStore();

    const [isDeleting, setIsDeleting] = useState(false);

    const isMobile = variant === 'mobile';
    const buttonClassName = isMobile
        ? 'flex w-full items-center gap-1.5 sm:w-auto'
        : 'flex w-full items-center gap-1.5';

    const handleDelete = async () => {
        if (window.confirm(tConfirmation('deleteReview'))) {
            setIsDeleting(true);
            try {
                await deleteReview(review.id);
                router.push(`/media/${review.mediaId}`);
            } catch (error) {
                console.error(error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleEdit = () => {
        setEditReviewData(review);
        setIsEditReviewModalOpen(true);
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
