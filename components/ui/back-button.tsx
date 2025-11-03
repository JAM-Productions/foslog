import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    href?: string;
    className?: string;
    iconSize?: number;
    'aria-label'?: string;
}

export function BackButton({
    href = '/',
    className,
    iconSize = 20,
    'aria-label': ariaLabel = 'Go back',
}: BackButtonProps) {
    const baseClasses =
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-foreground bg-card border border-border hover:bg-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background';

    return (
        <Link
            href={href}
            prefetch={true}
            className={[baseClasses, className].filter(Boolean).join(' ')}
            aria-label={ariaLabel}
        >
            <ArrowLeft style={{ width: iconSize, height: iconSize }} />
            <span>Back</span>
        </Link>
    );
}
