'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    (
        { className, label, checked, onCheckedChange, disabled, id, ...props },
        ref
    ) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked);
        };

        return (
            <div className={cn('flex items-center space-x-2', className)}>
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        className={cn(
                            'peer border-primary ring-offset-background focus-visible:ring-ring bg-background checked:bg-primary checked:border-primary h-4 w-4 shrink-0 appearance-none rounded-sm border transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                            className
                        )}
                        ref={ref}
                        id={inputId}
                        checked={checked}
                        disabled={disabled}
                        onChange={handleChange}
                        {...props}
                    />
                    <Check
                        className={cn(
                            'text-primary-foreground pointer-events-none absolute top-0 left-0 h-4 w-4 opacity-0 transition-opacity peer-checked:opacity-100',
                            disabled && 'text-muted-foreground'
                        )}
                        strokeWidth={3}
                    />
                </div>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            'cursor-pointer text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                            disabled && 'cursor-not-allowed opacity-70'
                        )}
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
