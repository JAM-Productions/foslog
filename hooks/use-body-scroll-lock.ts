import { useEffect } from 'react';

/**
 * Custom hook to disable/enable body scroll when modals are open
 * @param isOpen - Boolean indicating if the modal is open
 */
export function useBodyScrollLock(isOpen: boolean) {
    useEffect(() => {
        if (isOpen) {
            const originalStyle = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);
}
