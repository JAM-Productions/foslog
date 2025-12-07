'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
}

export function Toast({ message, show, onClose }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
            {message}
        </div>
    );
}
