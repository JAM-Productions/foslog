'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

export function Toast() {
    const { message, hideToast } = useToast();

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                hideToast();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, hideToast]);

    if (!message) {
        return null;
    }

    return (
        <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground">
                <Check />
                <span>{message}</span>
            </div>
        </div>
    );
}
