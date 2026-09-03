import { ListPreviewRowSkeleton } from '@/components/list/list-preview-row-skeleton';
import { Skeleton } from '@/components/skeleton';

export function ProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button Skeleton */}
            <div className="mb-6">
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            <div className="mb-8 flex flex-col gap-4">
                {/* Identity card with the metric strip */}
                <div className="bg-card rounded-lg border p-4 shadow-sm sm:p-6">
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4 sm:items-start sm:gap-x-6">
                        <div className="sm:row-span-2">
                            <Skeleton className="h-20 w-20 rounded-full sm:h-28 sm:w-28" />
                        </div>

                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-3 w-52" />
                            </div>
                            <Skeleton className="hidden h-9 w-24 rounded-md sm:block" />
                        </div>

                        <div className="col-span-2 flex flex-col gap-3 sm:col-span-1 sm:col-start-2">
                            <div className="w-full max-w-2xl space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                            <div className="flex gap-5">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-border mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border sm:mt-6 sm:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-background space-y-2 px-4 py-3"
                            >
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insight cards — bodies stay folded on phones, like the real ones */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-card h-full rounded-lg border p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-4 sm:hidden" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="mt-3 space-y-2.5">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3"
                                    >
                                        <Skeleton className="h-4 w-4 shrink-0" />
                                        <Skeleton className="h-4 w-16 shrink-0" />
                                        <Skeleton className="h-2 flex-1 rounded-full" />
                                        <Skeleton className="h-3 w-16 shrink-0" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <Skeleton className="h-5 w-28" />
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-6 w-20 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The distribution card is desktop only */}
                    <div className="bg-card hidden h-full w-full rounded-lg border p-4 shadow-sm sm:flex sm:flex-col">
                        <div className="flex items-center justify-between gap-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="mt-4 flex min-h-24 flex-1 items-end gap-1 sm:gap-1.5">
                                {[30, 15, 45, 25, 60, 40, 80, 55, 100, 70].map(
                                    (height, i) => (
                                        <Skeleton
                                            key={i}
                                            className="flex-1 rounded-sm"
                                            style={{ height: `${height}%` }}
                                        />
                                    )
                                )}
                            </div>
                            <div className="mt-4 flex gap-5 border-t pt-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Library Section */}
            <ListPreviewRowSkeleton withCreateButton />

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
