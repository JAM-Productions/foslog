import { Skeleton } from '@/components/ui/skeleton';

export default function UserMenuSkeleton() {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
            </div>
        </div>
    );
}
