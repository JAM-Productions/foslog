import Modal from './modal';
import { Button } from '../button/button';
import { useTranslations } from 'next-intl';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { LoaderCircle } from 'lucide-react';

export default function OptionsModal() {
    const { modal, hideModal } = useOptionsModalStore();

    const tCTA = useTranslations('CTA');

    useBodyScrollLock(modal.isOpen);

    return (
        <Modal isModalOpen={modal.isOpen}>
            <div className="flex h-full w-full flex-col justify-between">
                <div className="mb-10 flex w-full flex-col items-center justify-between space-y-7 text-center">
                    <h1
                        id="modal-title"
                        className="text-2xl font-semibold"
                    >
                        {modal.title}
                    </h1>
                    <p className="text-muted-foreground">{modal.description}</p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled={modal.isCTALoading}
                        onClick={() => hideModal()}
                    >
                        {tCTA('goBack')}
                    </Button>
                    <div className="relative flex w-full flex-row items-center">
                        <Button
                            variant="destructive"
                            className={`w-full ${modal.isCTALoading ? 'text-transparent' : ''}`}
                            disabled={modal.isCTALoading}
                            onClick={() => modal.ctaAction()}
                        >
                            {modal.ctaText}
                        </Button>
                        {modal.isCTALoading && (
                            <LoaderCircle className="text-destructive-foreground absolute left-1/2 -translate-x-1/2 animate-spin" />
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
