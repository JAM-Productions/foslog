import * as React from 'react';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'default',
            size = 'default',
            /* asChild = false, */
            ...props
        },
        ref
    ) => {
        const variants = {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            secondary:
                'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            destructive:
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline:
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
        };

        const sizes = {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8',
            icon: 'h-10 w-10',
        };

        const baseClasses =
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

        return (
            <button
                className={[
                    baseClasses,
                    variants[variant],
                    sizes[size],
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
Button.displayName = 'Button';

export { Button };
