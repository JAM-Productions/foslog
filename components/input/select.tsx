'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/button/button';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTranslations } from 'next-intl';
import Portal from '@/components/portal';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    onChange?: (value: string) => void;
}

const Select = ({
    options,
    value,
    placeholder,
    disabled = false,
    className = '',
    onChange,
}: SelectProps) => {
    const tSelect = useTranslations('Select');
    const defaultPlaceholder = placeholder || tSelect('selectPlaceholder');
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    useClickOutside(selectRef, isOpen, setIsOpen);

    useEffect(() => {
        if (isOpen && selectRef.current) {
            const rect = selectRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen]);

    const selectedOption = options.find((option) => option.value === value);

    const handleSelect = (optionValue: string) => {
        if (onChange) {
            onChange(optionValue);
        }
        setIsOpen(false);
    };

    return (
        <div
            className={`relative ${className}`}
            ref={selectRef}
        >
            <Button
                variant="outline"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex w-full cursor-pointer items-center justify-between gap-2"
            >
                <span className="flex-1 text-left">
                    {selectedOption ? selectedOption.label : defaultPlaceholder}
                </span>
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </Button>

            {isOpen && !disabled && (
                <Portal>
                    <div
                        className="bg-background fixed z-50 max-h-60 w-full overflow-y-auto rounded-lg border shadow-lg"
                        style={{
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                            width: `${dropdownPosition.width}px`,
                        }}
                    >
                        <div className="p-1">
                            {options.map((option) => (
                                <Button
                                key={option.value}
                                variant="ghost"
                                onClick={() => handleSelect(option.value)}
                                disabled={option.disabled}
                                className={`w-full cursor-pointer ${option.value === value ? 'bg-accent' : ''}`}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>
                </Portal>
            )}
        </div>
    );
};

export default Select;
