'use client';

import React from 'react';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BackButtonProps {
    className?: string;
    iconSize?: number;
    'aria-label'?: string;
}

export function BackButton({
    className,
    iconSize = 20,
    'aria-label': ariaLabel = 'Go back',
}: BackButtonProps) {
    const t = useTranslations('BackButton');
    const router = useRouter();
    const baseClasses =
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-foreground bg-card border border-border hover:bg-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer';

    return (
        <button
            type="button"
            onClick={() => router.back()}
            className={[baseClasses, className].filter(Boolean).join(' ')}
            aria-label={ariaLabel}
        >
            <ArrowLeft style={{ width: iconSize, height: iconSize }} />
            <span>{t('back')}</span>
        </button>
    );
}
