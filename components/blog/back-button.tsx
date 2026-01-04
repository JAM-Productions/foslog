'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2"
        >
            <ArrowLeft size={16} />
            <span>Back</span>
        </button>
    );
}
