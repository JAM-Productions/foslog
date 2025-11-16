'use client';

import dynamic from 'next/dynamic';

const ReviewModal = dynamic(() => import('./review-modal'), {
    ssr: false,
});

export default function DynamicModalWrapper() {
    return <ReviewModal />;
}
