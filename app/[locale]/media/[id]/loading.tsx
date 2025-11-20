export default function Loading() {
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                {/* Header with Back Button Skeleton */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-card h-10 w-24 animate-pulse rounded-lg"></div>
                </div>

                {/* Media Details Section Skeleton */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <div className="flex flex-col items-center gap-7 md:grid md:grid-cols-[1fr_auto] md:items-start">
                        {/* Image Skeleton */}
                        <div className="bg-muted relative mt-2 aspect-[2/3] w-72 flex-shrink-0 animate-pulse rounded-lg md:order-2 md:mt-0"></div>

                        {/* Card Skeleton */}
                        <div className="bg-card w-full self-stretch rounded-lg border p-4 sm:p-6 md:order-1 lg:p-8">
                            <div className="flex flex-col gap-4 sm:gap-6">
                                {/* Title and Type Skeleton */}
                                <div className="flex flex-row gap-4 sm:gap-6">
                                    <div className="bg-muted h-10 w-3/4 animate-pulse rounded lg:h-12"></div>
                                    <div className="bg-muted h-8 w-20 animate-pulse rounded-full"></div>
                                </div>

                                {/* Rating Skeleton */}
                                <div className="bg-muted flex flex-row items-center gap-3 rounded-lg py-3 sm:gap-4">
                                    <div className="bg-card h-8 w-32 animate-pulse rounded"></div>
                                    <div className="bg-card h-8 w-px"></div>
                                    <div className="bg-card h-6 w-24 animate-pulse rounded"></div>
                                </div>

                                {/* Description Skeleton */}
                                <div>
                                    <div className="bg-muted mb-2 h-6 w-32 animate-pulse rounded sm:mb-3"></div>
                                    <div className="space-y-2">
                                        <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                                        <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                                        <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section Skeleton */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="bg-muted h-8 w-48 animate-pulse rounded"></div>
                    </div>
                    <div className="bg-card border-border h-24 animate-pulse rounded-lg border py-6 text-center sm:py-8"></div>
                </div>

                {/* Review Form Section Skeleton */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <div className="bg-muted mb-4 h-8 w-40 animate-pulse rounded sm:mb-6"></div>
                    <div className="bg-card border-border rounded-lg border p-4 sm:p-6 lg:p-8">
                        <div className="bg-muted h-32 w-full animate-pulse rounded"></div>
                        <div className="bg-primary mt-4 h-10 w-32 animate-pulse rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
