'use client';

import { useState, useEffect } from 'react';

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
    const shouldTranslate =
        targetLanguage !== 'en' &&
        text &&
        typeof window !== 'undefined' &&
        'Translator' in (self as any);

    const [translatedText, setTranslatedText] = useState(
        shouldTranslate ? '' : text
    );
    const [isLoading, setIsLoading] = useState(shouldTranslate);

    useEffect(() => {
        if (!shouldTranslate) {
            setTranslatedText(text);
            setIsLoading(false);
            return;
        }

        const translate = async () => {
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
            } finally {
                setIsLoading(false);
            }
        };

        translate();
    }, [text, targetLanguage, shouldTranslate]);

    if (isLoading) {
        return (
            <span className={className}>
                <span className="inline-block w-full space-y-2">
                    <span className="bg-muted-foreground/20 block h-4 w-full animate-pulse rounded" />
                    <span className="bg-muted-foreground/20 block h-4 w-5/6 animate-pulse rounded" />
                    <span className="bg-muted-foreground/20 block h-4 w-4/5 animate-pulse rounded" />
                </span>
            </span>
        );
    }

    return <span className={className}>{translatedText}</span>;
}
