import { Skeleton } from '@/components/skeleton';

export default function UserMenuSkeleton() {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="hidden space-y-2 sm:block">
                <Skeleton className="h-4 w-[100px]" />
            </div>
        </div>
    );
}
