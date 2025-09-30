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
    'aria-label': ariaLabel = 'Go back'
}: BackButtonProps) {
    const baseClasses = "flex items-center justify-center rounded-md p-2 transition-colors text-primary hover:bg-gray-100 dark:hover:bg-background";

    return (
        <Link
            href={href}
            prefetch={true}
            className={[baseClasses, className].filter(Boolean).join(' ')}
            aria-label={ariaLabel}
        >
            <ArrowLeft className="h-5 w-5" style={{ width: iconSize, height: iconSize }} />
        </Link>
    );
}
