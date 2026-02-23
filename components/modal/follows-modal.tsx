'use client';

import { useEffect, useState } from 'react';
import Modal from './modal';
import { useTranslations } from 'next-intl';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { Button } from '../button/button';
import { User as UserIcon, X } from 'lucide-react';
import { User } from '@/lib/store';
import Image from 'next/image';
import { useFollowsModalStore } from '@/lib/follows-modal-store';
import { useRouter } from '@/i18n/navigation';
import UserListSkeleton from '../user/user-list-skeleton';
import { useAuth } from '@/lib/auth/auth-provider';
import { useToastStore } from '@/lib/toast-store';

interface UserWithFollowStatus extends User {
    isFollowing: boolean;
}

export default function FollowsModal() {
    const { user: currentUser } = useAuth();
    const { modal, setBehavior, hideModal } = useFollowsModalStore();
    const { showToast } = useToastStore();
    const tFollowsModal = useTranslations('FollowsModal');
    const tToast = useTranslations('Toast');
    const router = useRouter();

    const [followers, setFollowers] = useState<UserWithFollowStatus[]>([]);
    const [following, setFollowing] = useState<UserWithFollowStatus[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);

    const usersList = modal.behavior === 'followers' ? followers : following;
    const emptyMessage =
        modal.behavior === 'followers'
            ? tFollowsModal('noFollowers')
            : tFollowsModal('noFollowing');

    const toggleFollowButton = async (
        targetUserId: string,
        isCurrentlyFollowing: boolean
    ) => {
        if (!currentUser) {
            return router.push('/login');
        }

        if (pendingUserId) return;

        setPendingUserId(targetUserId);

        const prevFollowers = followers;
        const prevFollowing = following;

        setFollowers((prev) =>
            prev.map((user) =>
                user.id === targetUserId
                    ? { ...user, isFollowing: !user.isFollowing }
                    : user
            )
        );

        setFollowing((prev) =>
            prev.map((user) =>
                user.id === targetUserId
                    ? { ...user, isFollowing: !user.isFollowing }
                    : user
            )
        );

        try {
            const method = isCurrentlyFollowing ? 'DELETE' : 'POST';

            const response = await fetch(`/api/user/${targetUserId}/follow`, {
                method,
            });

            if (!response.ok) {
                throw new Error('Failed to toggle follow status');
            }
        } catch {
            showToast(tToast('toggleFollowFailed'), 'error');
            setFollowers(prevFollowers);
            setFollowing(prevFollowing);
        } finally {
            setPendingUserId(null);
        }
    };

    useEffect(() => {
        const fetchFollowData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `/api/user/${modal.userId}/follow`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch follow data');
                }
                const data = await response.json();
                setFollowers(data.followers);
                setFollowing(data.following);
            } catch {
                showToast(tToast('fetchUsersFailed'), 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (modal.isOpen && modal.userId && currentUser) {
            fetchFollowData();
        }
    }, [modal.isOpen, modal.userId, currentUser]);

    useBodyScrollLock(modal.isOpen);

    return (
        <Modal isModalOpen={modal.isOpen}>
            <div className="flex w-full flex-col sm:min-h-[50vh]">
                <div className="relative mb-10 flex w-full flex-col items-center justify-between text-center">
                    <h1
                        id="modal-title"
                        className="text-xl font-semibold"
                    >
                        {modal.userName}
                    </h1>
                    <Button
                        className="absolute right-0"
                        variant="ghost"
                        size="sm"
                        aria-label="Close"
                        onClick={() => {
                            hideModal();
                        }}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex">
                    <div className="flex w-full flex-col">
                        <Button
                            variant="ghost"
                            size="lg"
                            className={`w-full rounded-b-none ${modal.behavior === 'followers' ? '' : 'text-muted-foreground'}`}
                            onClick={() => setBehavior('followers')}
                        >
                            {tFollowsModal('followers')}
                        </Button>
                        {modal.behavior === 'followers' && (
                            <div className="bg-primary h-0.5 rounded-full" />
                        )}
                    </div>
                    <div className="flex w-full flex-col">
                        <Button
                            variant="ghost"
                            size="lg"
                            className={`w-full rounded-b-none ${modal.behavior === 'following' ? '' : 'text-muted-foreground'}`}
                            onClick={() => setBehavior('following')}
                        >
                            {tFollowsModal('following')}
                        </Button>
                        {modal.behavior === 'following' && (
                            <div className="bg-primary h-0.5 rounded-full" />
                        )}
                    </div>
                </div>
                {isLoading ? (
                    <UserListSkeleton />
                ) : (
                    <div className="mt-4">
                        <div className="flex flex-col gap-2">
                            {usersList.length === 0 && (
                                <p className="text-muted-foreground mt-2">
                                    {emptyMessage}
                                </p>
                            )}

                            {usersList.map((user) => (
                                <div key={user.id}>
                                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                                        <div className="flex min-w-0 flex-1 items-center gap-4">
                                            <div
                                                onClick={() => {
                                                    hideModal();
                                                    router.push(
                                                        `/profile/${user.id}`
                                                    );
                                                }}
                                                className="flex-shrink-0 cursor-pointer transition-opacity hover:opacity-80"
                                            >
                                                {user.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt={user.name}
                                                        width={40}
                                                        height={40}
                                                        className="h-10 w-10 rounded-full shadow-sm"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full border shadow-sm">
                                                        <UserIcon className="h-7 w-7" />
                                                    </div>
                                                )}
                                            </div>
                                            <a
                                                onClick={() => {
                                                    hideModal();
                                                    router.push(
                                                        `/profile/${user.id}`
                                                    );
                                                }}
                                                className="cursor-pointer truncate hover:underline"
                                            >
                                                {user.name}
                                            </a>
                                        </div>
                                        {currentUser?.id !== user.id && (
                                            <Button
                                                variant={
                                                    user.isFollowing
                                                        ? 'outline'
                                                        : 'secondary'
                                                }
                                                size="sm"
                                                disabled={
                                                    pendingUserId === user.id
                                                }
                                                onClick={() => {
                                                    toggleFollowButton(
                                                        user.id,
                                                        user.isFollowing
                                                    );
                                                }}
                                            >
                                                {user.isFollowing
                                                    ? tFollowsModal('following')
                                                    : tFollowsModal('follow')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
