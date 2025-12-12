'use client';

import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useLayoutEffect,
} from 'react';
import Portal from '@/components/portal';
import { useClickOutside } from '@/hooks/useClickOutside';

interface DropdownContextProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    triggerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextProps | undefined>(
    undefined
);

const useDropdown = () => {
    const context = useContext(DropdownContext);
    if (!context) {
        throw new Error('useDropdown must be used within a DropdownProvider');
    }
    return context;
};

const Dropdown = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useClickOutside(contentRef, isOpen, setIsOpen);

    return (
        <DropdownContext.Provider
            value={{ isOpen, setIsOpen, triggerRef, contentRef }}
        >
            {children}
        </DropdownContext.Provider>
    );
};

const DropdownTrigger = ({ children }: { children: React.ReactNode }) => {
    const { isOpen, setIsOpen, triggerRef } = useDropdown();
    return (
        <div
            ref={triggerRef}
            onClick={() => setIsOpen(!isOpen)}
        >
            {children}
        </div>
    );
};

const DropdownContent = ({ children }: { children: React.ReactNode }) => {
    const { isOpen, triggerRef, contentRef } = useDropdown();
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    useLayoutEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen, triggerRef]);

    if (!isOpen) {
        return null;
    }

    return (
        <Portal>
            <div
                ref={contentRef}
                data-testid="dropdown-content"
                style={{
                    position: 'absolute',
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    width: `${position.width}px`,
                    zIndex: 50,
                }}
                className="bg-background max-h-60 overflow-y-auto rounded-lg border shadow-lg"
            >
                {children}
            </div>
        </Portal>
    );
};

export { Dropdown, DropdownTrigger, DropdownContent };
