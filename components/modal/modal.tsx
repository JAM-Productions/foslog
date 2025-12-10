'use client';

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { Button } from '@/components/button/button';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
}: ModalProps) {
    useBodyScrollLock(isOpen);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (isOpen) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 sm:p-5"
                data-testid="modal-overlay"
                onClick={onClose}
            >
                <div
                    className="bg-muted flex h-screen w-full max-w-4xl flex-col p-5 sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:border"
                    aria-modal="true"
                    onClick={(e) => e.stopPropagation()}
                    aria-labelledby="modal-title"
                    data-testid="modal-container"
                >
                    <div className="mt-10 w-full shrink-0 space-y-2 pb-2 text-center sm:mt-0 sm:pb-0">
                        <div className="flex w-full flex-col justify-center sm:relative sm:flex-row">
                            <Button
                                className="absolute top-4 right-4 cursor-pointer sm:top-0 sm:right-0"
                                variant="ghost"
                                size="sm"
                                onClick={() => onClose()}
                                aria-label="Close modal"
                                data-testid="modal-close-button"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <h2
                                id="modal-title"
                                className="text-2xl font-bold"
                                data-testid="modal-title"
                            >
                                {title}
                            </h2>
                        </div>
                        <p
                            className="text-muted-foreground text-center"
                            data-testid="modal-description"
                        >
                            {description}
                        </p>
                    </div>

                    <div
                        className="flex min-h-0 flex-1 flex-col items-center gap-4 px-1 py-4 sm:gap-8 sm:py-8"
                        data-testid="modal-body"
                    >
                        {children}
                    </div>
                    {footer && (
                        <div
                            className="flex w-full shrink-0 flex-col items-center justify-center pt-4 sm:pt-0"
                            data-testid="modal-footer"
                        >
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
