'use client';

import { Button } from '@/components/button/button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { LoaderCircle } from 'lucide-react';
import { useToastStore } from '@/lib/toast-store';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-provider';

interface CommentFormProps {
    reviewId: string;
}

export function CommentForm({ reviewId }: CommentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToastStore();
    const tToast = useTranslations('Toast');
    const tRP = useTranslations('ReviewPage');
    const router = useRouter();
    const { user } = useAuth();

    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            return router.push('/login');
        }
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reviewId, comment }),
            });
            if (response.ok) {
                showToast(tToast('commentCreated'), 'success');
                router.refresh();
            } else {
                showToast(tToast('commentCreateFailed'), 'error');
            }
        } catch (error) {
            setError(
                error instanceof Error ? error.message : 'An error occurred'
            );
            showToast(tToast('commentCreateFailed'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="space-y-4 sm:space-y-6"
            onSubmit={handleSubmit}
        >
            <div>
                <label
                    htmlFor="comment"
                    className="text-foreground mb-2 block text-sm font-semibold"
                >
                    {tRP('yourComment')}
                </label>
                <textarea
                    id="comment"
                    placeholder={tRP('shareReviewThoughts')}
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                    required
                />
            </div>
            {error && (
                <p
                    className="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}
            <div className="relative flex w-full flex-row items-center sm:w-auto">
                <Button
                    type="submit"
                    className={`w-full cursor-pointer sm:w-auto ${
                        isSubmitting ? 'text-transparent' : ''
                    }`}
                    disabled={isSubmitting}
                >
                    {tRP('sendComment')}
                </Button>
                {isSubmitting && (
                    <LoaderCircle className="text-primary absolute left-1/2 -translate-x-1/2 animate-spin sm:left-[4.4rem] sm:-translate-x-1/12" />
                )}
            </div>
        </form>
    );
}
