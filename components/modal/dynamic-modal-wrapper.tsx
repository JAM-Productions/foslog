'use client';

import dynamic from 'next/dynamic';

const ConfigModal = dynamic(() => import('./config-modal'), {
    ssr: false,
});

const ReviewModal = dynamic(() => import('./review-modal'), {
    ssr: false,
});

export default function DynamicModalWrapper() {
    return (
        <>
            <ConfigModal />
            <ReviewModal />
        </>
    );
}
