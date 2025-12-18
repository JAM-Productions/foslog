'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import { useAppStore } from '@/lib/store';
import { ReviewForm } from './review-form';
import { useTranslations } from 'next-intl';

export function EditReviewModal() {
    const { isEditReviewModalOpen, closeEditReviewModal, editReviewData } =
        useAppStore();
    const t = useTranslations('MediaPage');

    return (
        <Dialog open={isEditReviewModalOpen} onOpenChange={closeEditReviewModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('editReview')}</DialogTitle>
                </DialogHeader>
                {editReviewData && (
                    <ReviewForm
                        mediaId={editReviewData.mediaId}
                        reviewData={editReviewData}
                        onSuccess={closeEditReviewModal}
                    />
                )}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={closeEditReviewModal}
                        className="w-full"
                    >
                        {t('cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
