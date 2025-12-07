'use client';

import { useState } from 'react';

export function useToast() {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const show = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const hide = () => {
        setShowToast(false);
        setToastMessage('');
    };

    return {
        showToast,
        toastMessage,
        show,
        hide,
    };
}
