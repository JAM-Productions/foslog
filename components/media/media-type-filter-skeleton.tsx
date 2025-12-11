import { Skeleton } from '@/components/skeleton';

const MediaTypeFilterSkeleton = () => {
    return (
        <div className="bg-muted flex items-center gap-1 overflow-x-auto rounded-lg p-1">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="flex cursor-default flex-col items-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap sm:flex-row"
                >
                    <Skeleton className="h-4 w-4 sm:mr-1.5" />
                    <Skeleton className="mt-1 h-4 w-12 sm:mt-0" />
                </div>
            ))}
        </div>
    );
};

export default MediaTypeFilterSkeleton;
