'use client';

import { Toast } from '@/components/toast/toast';
import { useToastStore } from '@/lib/toast-store';

export function ToastProvider() {
    const { toast, hideToast } = useToastStore();

    if (!toast.isVisible) {
        return null;
    }

    return (
        <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
        />
    );
}
