'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/alert-dialog/alert-dialog';
import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function DeleteReviewModal() {
    const { isDeleteReviewModalOpen, closeDeleteReviewModal, deleteReviewId } =
        useAppStore();
    const t = useTranslations('MediaPage');
    const router = useRouter();

    const handleDelete = async () => {
        if (!deleteReviewId) return;

        try {
            const response = await fetch('/api/review', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reviewId: deleteReviewId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Failed to delete the review.'
                );
            }

            toast.success(t('reviewDeleted'));
            closeDeleteReviewModal();
            router.refresh();
        } catch (error) {
            console.error('Failed to delete review:', error);
            toast.error(
                error instanceof Error ? error.message : t('deleteFailed')
            );
        }
    };

    return (
        <AlertDialog
            open={isDeleteReviewModalOpen}
            onOpenChange={closeDeleteReviewModal}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteWarning')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={closeDeleteReviewModal}>
                        {t('cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        {t('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
