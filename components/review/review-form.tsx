import { Button } from '@/components/button/button';
import { RatingInput } from '@/components/input/rating';
import { useTranslations } from 'next-intl';

export function ReviewForm() {
    const t = useTranslations('MediaPage');

    return (
        <form className="space-y-4 sm:space-y-6">
            <fieldset>
                <legend className="text-foreground mb-2 block text-xs font-semibold sm:text-sm">
                    {t('yourRating')}
                </legend>
                <RatingInput size="lg" />
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
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                />
            </div>
            <Button
                type="submit"
                className="w-full sm:w-auto"
            >
                {t('submitReview')}
            </Button>
        </form>
    );
}
