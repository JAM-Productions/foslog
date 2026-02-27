'use client';

import dynamic from 'next/dynamic';

const ConfigModal = dynamic(() => import('./config-modal'), {
    ssr: false,
});

const ReviewModal = dynamic(() => import('./review-modal'), {
    ssr: false,
});

const OptionsModal = dynamic(() => import('./options-modal'), {
    ssr: false,
});

const FollowsModal = dynamic(() => import('./follows-modal'), {
    ssr: false,
});

const ImportReviewsModal = dynamic(() => import('./import-reviews-modal'), {
    ssr: false,
});

export default function DynamicModalWrapper() {
    return (
        <>
            <ConfigModal />
            <ReviewModal />
            <OptionsModal />
            <FollowsModal />
            <ImportReviewsModal />
        </>
    );
}
