import { Card } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating';
import { MediaItem } from '@/lib/store';
import Image from 'next/image';

export function MediaDetails({ media }: { media: MediaItem }) {
    const imageUrl = media.poster || media.cover;

    return (
        <Card className="p-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex items-start justify-center md:col-span-1">
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={media.title}
                            width={500}
                            height={750}
                            className="h-auto max-h-96 max-w-full rounded-lg object-contain"
                        />
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
