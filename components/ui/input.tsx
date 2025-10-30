import * as React from 'react';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'outline' | 'filled';
    inputSize?: 'default' | 'sm' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            variant = 'default',
            inputSize = 'default',
            type = 'text',
            ...props
        },
        ref
    ) => {
        const variants = {
            default: 'border border-input bg-background',
            outline: 'border-2 border-input bg-transparent',
            filled: 'border-0 bg-muted',
        };

        const sizes = {
            default: 'h-10 px-3 py-2',
            sm: 'h-8 px-2 py-1',
            lg: 'h-12 px-4 py-3 text-lg',
        };

        const baseClasses =
            'flex w-full rounded-md text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

        return (
            <input
                type={type}
                className={[
                    baseClasses,
                    variants[variant],
                    sizes[inputSize],
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
