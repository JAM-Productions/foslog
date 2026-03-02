'use client';

import { MediaType } from '@/lib/store';
import { ListTableFormat } from './list-table-format';
import { ListColFormat } from './list-col-format';
import { useAuth } from '@/lib/auth/auth-provider';
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { useToastStore } from '@/lib/toast-store';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export interface ListMediaContentProps {
    listId: string;
    mediaItems: {
        id: string;
        mediaId: string;
        createdAt: Date;
        media: {
            id: string;
            title: string;
            type: MediaType;
            year?: number;
            poster?: string;
        };
    }[];
    listUser: {
        id: string;
        name: string;
        image?: string;
    };
}

export function ListMediaContent({
    listId,
    mediaItems,
    listUser,
}: ListMediaContentProps) {
    const { user: currentUser } = useAuth();
    const isOwner = currentUser?.id === listUser.id;

    const { showModal, setIsCTALoading, hideModal } = useOptionsModalStore();
    const { showToast } = useToastStore();
    const tToast = useTranslations('Toast');
    const tCTA = useTranslations('CTA');
    const t = useTranslations('ListPage');
    const router = useRouter();

    const deleteMediaFromList = async (mediaId: string) => {
        setIsCTALoading(true);
        try {
            const response = await fetch(`/api/list`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mediaId,
                    listId,
                }),
            });
            if (response.ok) {
                router.refresh();
                showToast(tToast('mediaRemovedFromList'), 'success');
            } else {
                showToast(tToast('mediaRemoveFromListFailed'), 'error');
            }
        } catch (error) {
            console.error('Failed to remove media from list:', error);
            showToast(tToast('mediaRemoveFromListFailed'), 'error');
        } finally {
            setIsCTALoading(false);
            hideModal();
        }
    };

    const openDeleteModal = (mediaId: string, mediaTitle: string) => {
        showModal(
            t('deleteMediaFromListTitle', { title: mediaTitle }),
            t('deleteMediaFromListDescription'),
            tCTA('delete'),
            () => deleteMediaFromList(mediaId)
        );
    };

    return (
        <div className="mt-8">
            {/* Mobile View */}
            <div className="lg:hidden">
                <ListColFormat
                    mediaItems={mediaItems}
                    isOwner={isOwner}
                    openDeleteModal={openDeleteModal}
                />
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
                <ListTableFormat
                    mediaItems={mediaItems}
                    isOwner={isOwner}
                    openDeleteModal={openDeleteModal}
                />
            </div>
        </div>
    );
}
