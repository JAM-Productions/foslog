
'use client';

import { Button } from './ui/button';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SubmitButtonProps {
    isDisabled: boolean;
    isLoading: boolean;
    onClick: () => void;
    size?: 'sm' | 'lg' | 'default' | 'icon' | undefined;
    variant?:
        | 'default'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link'
        | undefined;
}

export default function SubmitButton({
    isDisabled,
    isLoading,
    onClick,
    size,
    variant,
}: SubmitButtonProps) {
    const tMediaPage = useTranslations('MediaPage');

    return (
        <div className="relative flex flex-row items-center justify-center">
            <Button
                disabled={isDisabled || isLoading}
                onClick={onClick}
                className={`cursor-pointer ${
                    isLoading ? 'text-transparent' : ''
                }`}
                size={size}
                variant={variant}
            >
                {tMediaPage('submitReview')}
            </Button>
            {isLoading && (
                <LoaderCircle className="text-primary absolute animate-spin" />
            )}
        </div>
    );
}
