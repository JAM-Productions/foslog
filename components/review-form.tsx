import { Button } from '@/components/ui/button';
import { RatingInput } from '@/components/ui/rating';

export function ReviewForm() {
    return (
        <form className="space-y-6">
            <div>
                <label
                    id="rating-label"
                    className="text-foreground mb-2 block text-sm font-semibold"
                >
                    Your Rating
                </label>
                <RatingInput
                    aria-labelledby="rating-label"
                    size="lg"
                />
            </div>
            <div>
                <label
                    htmlFor="comment"
                    className="text-foreground mb-2 block text-sm font-semibold"
                >
                    Your Review
                </label>
                <textarea
                    id="comment"
                    placeholder="Share your thoughts about this media..."
                    rows={4}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
            <Button
                type="submit"
                className="w-full sm:w-auto"
            >
                Submit Review
            </Button>
        </form>
    );
}
