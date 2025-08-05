import { useCallback, useEffect } from 'react';

export const useClickOutside = (
    ref: React.RefObject<HTMLElement | null>,
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
) => {
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                ref.current &&
                event.target instanceof Node &&
                !ref.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        },
        [ref, setIsOpen]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);
};
