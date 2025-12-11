import { Skeleton } from '@/components/skeleton';

export function ProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button Skeleton */}
            <div className="mb-6">
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-3">
                {/* Header Section & Genres */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <div className="bg-card flex h-fit min-h-[206px] flex-col items-center rounded-lg border p-6 shadow-sm sm:flex-row sm:items-start sm:gap-8">
                        <div className="mb-4 sm:mb-0">
                            <Skeleton className="h-24 w-24 rounded-full sm:h-30 sm:w-32" />
                        </div>

                        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
                            <Skeleton className="h-4 w-32" />
                            <div className="mt-4 w-full max-w-lg space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-6 sm:justify-start">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col items-center gap-1 sm:items-start"
                                    >
                                        <Skeleton className="h-8 w-12" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <Skeleton className="mb-3 h-5 w-24" />
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton
                                    key={i}
                                    className="h-6 w-20 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="space-y-6">
                    <div className="bg-card w-full rounded-lg border p-4 shadow-sm">
                        <Skeleton className="mb-4 h-6 w-32" />
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2"
                                >
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-4 flex-1 rounded-full" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-20" />
            </div>

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-card overflow-hidden rounded-lg border"
                    >
                        <div className="flex flex-col sm:flex-row">
                            <Skeleton className="h-48 w-full shrink-0 sm:h-auto sm:w-32" />
                            <div className="flex flex-1 flex-col p-4 sm:p-5">
                                <div className="mb-2 flex items-start justify-between">
                                    <div className="space-y-1">
                                        <Skeleton className="h-6 w-40" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-4/6" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
