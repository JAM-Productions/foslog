'use client';

import { useState } from 'react';

export const useShare = () => {
    const [isCopied, setIsCopied] = useState(false);

    const share = async (text: string) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    text,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (error) {
                console.error('Error copying to clipboard:', error);
            }
        }
    };

    return { isCopied, share };
};
