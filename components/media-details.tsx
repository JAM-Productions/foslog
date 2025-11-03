import { Card } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating';

export function MediaDetails({ media }: { media: any }) {
    const imageUrl = media.poster || media.cover;

    return (
        <Card className="overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-3 lg:p-8">
                {/* Image Section */}
                <div className="flex items-start justify-center lg:col-span-1">
                    {imageUrl ? (
                        <div className="relative w-full max-w-sm">
                            <img
                                src={imageUrl}
                                alt={media.title}
                                className="h-auto w-full rounded-lg object-cover shadow-md"
                            />
                        </div>
                    ) : (
                        <div className="bg-muted flex aspect-[2/3] w-full max-w-sm items-center justify-center rounded-lg">
                            <span className="text-muted-foreground">
                                No image
                            </span>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* Title and Type */}
                    <div>
                        <h1 className="text-foreground mb-2 text-4xl font-bold">
                            {media.title}
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">
                                {media.type}
                            </span>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-muted flex items-center gap-4 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <RatingDisplay
                                rating={media.averageRating}
                                size="lg"
                            />
                            <span className="text-foreground text-2xl font-bold">
                                {media.averageRating.toFixed(1)}
                            </span>
                        </div>
                        <div className="bg-border h-8 w-px"></div>
                        <span className="text-muted-foreground">
                            {media.totalReviews}{' '}
                            {media.totalReviews === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-foreground mb-3 text-xl font-semibold">
                            Overview
                        </h2>
                        <p className="text-card-foreground leading-relaxed">
                            {media.description}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
