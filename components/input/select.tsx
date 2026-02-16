'use client';

import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/button/button';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useTranslations } from 'next-intl';

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

    useClickOutside(selectRef, isOpen, setIsOpen);

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
                <div className="bg-background absolute top-12 right-0 left-0 z-50 max-h-60 overflow-y-auto rounded-lg border shadow-lg">
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
            )}
        </div>
    );
};

export default Select;
