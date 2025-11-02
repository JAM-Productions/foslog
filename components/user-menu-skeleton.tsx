import { Skeleton } from '@/components/ui/skeleton';

const UserMenuSkeleton = () => {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="hidden h-4 w-20 sm:inline" />
        </div>
    );
};

export default UserMenuSkeleton;
