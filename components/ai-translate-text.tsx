'use client';

import { useState, useMemo } from 'react';

interface AITranslateTextProps {
    text: string;
    targetLanguage: string;
    className?: string;
}

export function AITranslateText({
    text,
    targetLanguage,
    className,
}: AITranslateTextProps) {
    const [translatedText, setTranslatedText] = useState(text);

    useMemo(() => {
        if (targetLanguage === 'en' || !text) {
            setTranslatedText(text);
            return;
        }

        if (typeof window === 'undefined' || !('Translator' in (self as any))) {
            setTranslatedText(text);
            return;
        }

        (async () => {
            try {
                // @ts-ignore - Chrome's Translator API
                const translator = await Translator.create({
                    sourceLanguage: 'en',
                    targetLanguage,
                });
                const translated = await translator.translate(text);
                setTranslatedText(translated);
            } catch {
                setTranslatedText(text);
            }
        })();
    }, [text, targetLanguage]);

    return <span className={className}>{translatedText}</span>;
}
