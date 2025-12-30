'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    /**
     * Callback function to close the toast.
     * This function should be memoized (e.g., using useCallback) to prevent unnecessary re-renders.
     */
    onClose: () => void;
}

export function Toast({
    message,
    type = 'success',
    duration = 3000,
    onClose,
}: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const typeStyles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white',
    };

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 flex min-w-[300px] max-w-md items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-5 fade-in ${typeStyles[type]}`}
            role="alert"
            aria-live="polite"
        >
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/20"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
