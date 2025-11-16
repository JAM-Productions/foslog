import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { MediaItem } from '@/lib/store';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function MediaDetails({ media }: { media: MediaItem }) {
    const imageUrl = media.poster || media.cover;
    const tMP = useTranslations('MediaPage');
    const tMT = useTranslations('MediaTypes');

    return (
        <Card className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 sm:gap-8 md:flex-row">
                {/* Image Section */}
                <div className="flex shrink-0 items-start justify-center md:w-64 lg:w-80">
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={media.title}
                            width={500}
                            height={750}
                            className="h-auto max-h-80 max-w-full rounded-lg object-contain shadow-lg sm:max-h-96"
                        />
                    )}
                </div>

                {/* Details Section */}
                <div className="flex flex-1 flex-col gap-4 sm:gap-6">
                    {/* Title and Type */}
                    <div className="flex flex-row gap-4 sm:gap-6">
                        <h1 className="text-foreground text-3xl leading-tight font-bold lg:text-4xl">
                            {media.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-medium sm:text-sm">
                                {tMT(media.type)}
                            </span>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-muted flex flex-row items-start gap-3 rounded-lg py-3 sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2">
                            <RatingDisplay
                                rating={media.averageRating}
                                size="lg"
                            />
                        </div>
                        <div className="bg-border block h-8 w-px"></div>
                        <span className="text-muted-foreground text-base">
                            {media.totalReviews}{' '}
                            {media.totalReviews === 1
                                ? tMP('review')
                                : tMP('reviews')}
                        </span>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-foreground mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
                            {tMP('overview')}
                        </h2>
                        <p className="text-card-foreground text-sm leading-relaxed sm:text-base">
                            {media.description}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
