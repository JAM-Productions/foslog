'use client';

import { useAppStore } from '@/lib/store';
import { lazy, Suspense } from 'react';

// Lazy import modals
const AddReviewModal = lazy(() => import('./add-review-modal'));

export default function Modals() {
    const { isAddReviewModalOpen } = useAppStore();

    return (
        <>
            {/* Add Review Modal */}
            {isAddReviewModalOpen && (
                <Suspense fallback={null}>
                    <AddReviewModal />
                </Suspense>
            )}

            {/* Add future modals here with their respective conditions */}
        </>
    );
}
