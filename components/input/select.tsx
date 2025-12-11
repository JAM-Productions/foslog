'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/button/button';
import { useTranslations } from 'next-intl';
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
} from '@/components/input/dropdown';

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

    const selectedOption = options.find((option) => option.value === value);

    const handleSelect = (optionValue: string) => {
        if (onChange) {
            onChange(optionValue);
        }
    };

    return (
        <Dropdown>
            <div className={`relative ${className}`}>
                <DropdownTrigger>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className="flex w-full cursor-pointer items-center justify-between gap-2"
                    >
                        <span className="flex-1 text-left">
                            {selectedOption
                                ? selectedOption.label
                                : defaultPlaceholder}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownTrigger>
                {!disabled && (
                    <DropdownContent>
                        <div className="p-1">
                            {options.length > 0 ? (
                                options.map((option) => (
                                    <Button
                                        key={option.value}
                                        variant="ghost"
                                        onClick={() =>
                                            handleSelect(option.value)
                                        }
                                        disabled={option.disabled}
                                        className={`w-full cursor-pointer ${
                                            option.value === value
                                                ? 'bg-accent'
                                                : ''
                                        }`}
                                    >
                                        {option.label}
                                    </Button>
                                ))
                            ) : (
                                <div className="text-muted-foreground p-3 text-center">
                                    {tSelect('noOptions')}
                                </div>
                            )}
                        </div>
                    </DropdownContent>
                )}
            </div>
        </Dropdown>
    );
};

export default Select;
