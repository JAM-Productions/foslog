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

    const updateFollowStatus = (
        users: UserWithFollowStatus[],
        targetUserId: string
    ) => {
        return users.map((user) =>
            user.id === targetUserId
                ? { ...user, isFollowing: !user.isFollowing }
                : user
        );
    };

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

        setFollowers((prev) => updateFollowStatus(prev, targetUserId));
        setFollowing((prev) => updateFollowStatus(prev, targetUserId));

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

    const clearStates = () => {
        setFollowers([]);
        setFollowing([]);
        setIsLoading(true);
        setPendingUserId(null);
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
        } else {
            setIsLoading(false);
        }
    }, [modal.isOpen]);

    useBodyScrollLock(modal.isOpen);

    return (
        <Modal isModalOpen={modal.isOpen}>
            {/* Minimum height matches the loading skeleton, so the modal keeps
                its size once the list resolves. */}
            <div className="flex min-h-0 w-full flex-1 flex-col sm:min-h-[409px]">
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
                            clearStates();
                            hideModal();
                            if (currentUser?.id === modal.userId) {
                                router.refresh();
                            }
                        }}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="mb-6 flex h-10 w-full items-center justify-start rounded-none border-b bg-transparent p-0">
                    {(['followers', 'following'] as const).map((behavior) => (
                        <button
                            key={behavior}
                            data-testid={`follows-tab-${behavior}`}
                            onClick={() => setBehavior(behavior)}
                            className={`relative h-10 cursor-pointer px-4 text-sm font-medium transition-colors sm:text-base ${
                                modal.behavior === behavior
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tFollowsModal(behavior)}
                            {modal.behavior === behavior && (
                                <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
                {isLoading ? (
                    <UserListSkeleton />
                ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto">
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
                                            <div className="flex min-w-0 flex-1 items-center gap-4 text-left">
                                                <button
                                                    type="button"
                                                    aria-label={user.name}
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
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cursor-pointer truncate hover:underline"
                                                    onClick={() => {
                                                        hideModal();
                                                        router.push(
                                                            `/profile/${user.id}`
                                                        );
                                                    }}
                                                >
                                                    {user.name}
                                                </button>
                                            </div>
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
