'use client';

interface ModalProps {
    isModalOpen: boolean;
    children: React.ReactNode;
}

export default function Modal({ isModalOpen, children }: ModalProps) {
    if (!isModalOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 sm:p-5">
            <div
                className="bg-muted flex h-screen w-full max-w-4xl flex-col p-5 sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:border"
                aria-modal="true"
                aria-labelledby="modal-title"
                role="dialog"
            >
                {children}
            </div>
        </div>
    );
}
