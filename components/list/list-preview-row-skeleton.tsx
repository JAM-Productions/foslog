import { Skeleton } from '@/components/skeleton';
import { LISTS_PREVIEW_LIMIT } from '@/lib/constants';

export function ListCardSkeleton() {
    return (
        <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
            <Skeleton className="h-16 w-16 shrink-0 rounded-lg sm:h-24 sm:w-24" />
            <div className="flex flex-col gap-1 sm:w-24">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}

export interface ListPreviewRowSkeletonProps {
    /** Reserves the space taken by the "create list" button. */
    withCreateButton?: boolean;
    count?: number;
}

export function ListPreviewRowSkeleton({
    withCreateButton = false,
    count = LISTS_PREVIEW_LIMIT,
}: ListPreviewRowSkeletonProps) {
    return (
        <div className="mb-6">
            <div className="mb-6 flex items-center justify-between gap-4 border-b">
                <Skeleton className="mb-4 h-7 w-40" />
                {withCreateButton && (
                    <Skeleton className="mb-4 h-9 w-32 rounded-md" />
                )}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
                {Array.from({ length: count }).map((_, index) => (
                    <ListCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
}
