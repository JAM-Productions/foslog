'use client';

import { Button } from '@/components/ui/button';
import { RatingInput } from '@/components/ui/input/rating';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
    mediaId: string;
}

export function ReviewForm({ mediaId }: ReviewFormProps) {
    const t = useTranslations('MediaPage');
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mediaId,
                    review: {
                        stars: rating,
                        text: text.trim(),
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            // Reset form
            setRating(0);
            setText('');

            // Refresh the page to show the new review
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="space-y-4 sm:space-y-6"
            onSubmit={handleSubmit}
        >
            <fieldset>
                <legend className="text-foreground mb-2 block text-xs font-semibold sm:text-sm">
                    {t('yourRating')}
                </legend>
                <RatingInput
                    size="lg"
                    value={rating}
                    onChange={setRating}
                />
            </fieldset>
            <div>
                <label
                    htmlFor="comment"
                    className="text-foreground mb-2 block text-xs font-semibold sm:text-sm"
                >
                    {t('yourReview')}
                </label>
                <textarea
                    id="comment"
                    placeholder={t('shareThoughts')}
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                    disabled={isSubmitting}
                />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting || rating === 0 || !text.trim()}
            >
                {isSubmitting
                    ? t('submitting') || 'Submitting...'
                    : t('submitReview')}
            </Button>
        </form>
    );
}
