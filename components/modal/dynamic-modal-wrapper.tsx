'use client';

import dynamic from 'next/dynamic';

const ReviewModal = dynamic(() => import('./review-modal'), {
    ssr: false,
});
const ConfigurationModal = dynamic(() => import('./configuration-modal'), {
    ssr: false,
});

export default function DynamicModalWrapper() {
    return (
        <>
            <ReviewModal />
            <ConfigurationModal />
        </>
    );
}
