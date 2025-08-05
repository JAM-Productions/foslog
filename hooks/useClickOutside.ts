import { useCallback, useEffect } from 'react';

export const useClickOutside = (
    ref: React.RefObject<HTMLElement | null>,
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
) => {
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        },
        [ref, setIsOpen]
    );

    useEffect(() => {
        if (!isOpen) return;

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);
};
