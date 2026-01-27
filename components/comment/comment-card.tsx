'use client';

import { Card } from '@/components/card';
import { SafeComment } from '@/lib/types';
import { Trash, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '../button/button';
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { useToastStore } from '@/lib/toast-store';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';

export function CommentCard({ comment }: { comment: SafeComment }) {
    const { user } = comment;
    const router = useRouter();
    const { showModal, setIsCTALoading, hideModal } = useOptionsModalStore();
    const { showToast } = useToastStore();
    const tToast = useTranslations('Toast');
    const tCTA = useTranslations('CTA');
    const t = useTranslations('ReviewPage');
    const { user: currentUser } = useAuth();

    const deleteComment = async () => {
        setIsCTALoading(true);
        try {
            const response = await fetch('/api/comment', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentId: comment.id,
                    reviewId: comment.reviewId,
                }),
            });
            if (response.ok) {
                router.refresh();
                showToast(tToast('commentDeleted'), 'success');
            } else {
                showToast(tToast('commentDeleteFailed'), 'error');
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
            showToast(tToast('commentDeleteFailed'), 'error');
        } finally {
            setIsCTALoading(false);
            hideModal();
        }
    };

    return (
        <Card className="flex h-full flex-col p-4 sm:p-6">
            <div className="flex flex-row items-center gap-3 sm:gap-4">
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile/${user.id}`);
                    }}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                >
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                            unoptimized
                        />
                    ) : (
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full border">
                            <User className="h-7 w-7" />
                        </div>
                    )}
                </div>
                <div className="relative flex-1">
                    <div className="flex items-center justify-between">
                        <p
                            className="cursor-pointer text-base font-bold hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profile/${user.id}`);
                            }}
                        >
                            {user.name}
                        </p>
                        {user.id === currentUser?.id && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-2 p-0"
                                onClick={() =>
                                    showModal(
                                        t('deleteCommentTitle'),
                                        t('deleteCommentDescription'),
                                        tCTA('delete'),
                                        deleteComment
                                    )
                                }
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <p className="mt-3 text-base leading-relaxed sm:mt-4">
                    {comment.comment}
                </p>
            </div>
        </Card>
    );
}
