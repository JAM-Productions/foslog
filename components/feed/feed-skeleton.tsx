import { Skeleton } from '@/components/skeleton';

/** Placeholder for the feed screen while the first page loads. */
export function FeedSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            <div className="mb-6 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            <div className="mb-6">
                <Skeleton className="h-10 w-full rounded-lg sm:w-64" />
            </div>

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="bg-card overflow-hidden rounded-lg border"
                    >
                        <div className="flex min-h-28 sm:min-h-44">
                            <Skeleton className="w-24 shrink-0 rounded-none sm:w-32" />
                            <div className="flex flex-1 flex-col p-3 sm:p-5">
                                <div className="mb-2 flex items-center gap-2">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="mb-3 h-5 w-24" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
