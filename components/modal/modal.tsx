'use client';

import { Button } from '@/components/button/button';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    showCloseButton?: boolean;
    ariaLabelledBy?: string;
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
};

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = '4xl',
    showCloseButton = true,
    ariaLabelledBy = 'modal-title',
}: ModalProps) {
    useBodyScrollLock(isOpen);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 sm:p-5">
            <div
                className={`bg-muted flex h-screen w-full ${maxWidthClasses[maxWidth]} flex-col p-5 sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:border`}
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
            >
                <div className="mt-10 w-full shrink-0 space-y-2 pb-2 text-center sm:mt-0 sm:pb-0">
                    <div className="flex w-full flex-col justify-center sm:relative sm:flex-row">
                        {showCloseButton && (
                            <Button
                                className="absolute top-4 right-4 sm:top-0 sm:right-0"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                        <h2
                            id={ariaLabelledBy}
                            className="text-2xl font-bold"
                        >
                            {title}
                        </h2>
                    </div>
                    {description && (
                        <p className="text-muted-foreground text-center">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col items-center gap-4 px-1 py-4 sm:gap-8 sm:py-8">
                    {children}
                </div>

                {footer && (
                    <div className="flex w-full shrink-0 flex-col items-center justify-center pt-4 sm:pt-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
