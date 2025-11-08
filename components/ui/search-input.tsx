import * as React from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface Suggestions {
    title: string;
    image: string;
}

export interface SearchInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSelect'> {
    variant?: 'default' | 'outline' | 'filled';
    inputSize?: 'default' | 'sm' | 'lg';
    suggestions?: Suggestions[];
    loading?: boolean;
    onSelect: (suggestion: Suggestions) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            className,
            variant = 'default',
            inputSize = 'default',
            suggestions = [],
            loading = false,
            onFocus,
            onSelect,
            ...props
        },
        ref
    ) => {
        const searchInputRef = React.useRef<HTMLDivElement>(null);
        const [isOpen, setIsOpen] = React.useState(false);

        useClickOutside(searchInputRef, isOpen, setIsOpen);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsOpen(true);
            onFocus?.(e);
        };

        const handleSelect = (suggestion: Suggestions) => {
            onSelect?.(suggestion);
            setIsOpen(false);
        };

        const variants = {
            default: 'border border-input bg-background',
            outline: 'border-2 border-input bg-transparent',
            filled: 'border-0 bg-muted',
        };

        const sizes = {
            default: 'h-10 px-4 py-2',
            sm: 'h-8 px-2 py-1 text-sm',
            lg: 'h-12 px-4 py-3 text-lg',
        };

        const baseClasses =
            'flex w-full rounded-md text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

        return (
            <div
                className="relative"
                ref={searchInputRef}
            >
                <input
                    type="text"
                    className={[
                        baseClasses,
                        variants[variant],
                        sizes[inputSize],
                        className,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    ref={ref}
                    onFocus={handleFocus}
                    {...props}
                />
                {isOpen &&
                    (loading ||
                        suggestions.length > 0 ||
                        (!loading &&
                            suggestions.length === 0 &&
                            props.value)) && (
                        <div className="bg-background absolute top-12 right-0 left-0 z-50 max-h-60 overflow-y-auto rounded-lg border shadow-lg">
                            <div className="p-1">
                                {loading ? (
                                    <div className="flex items-center justify-center p-3">
                                        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                        <span className="text-muted-foreground ml-2 text-sm">
                                            Loading...
                                        </span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((option, index) => (
                                        <p
                                            key={index}
                                            className="hover:bg-muted cursor-pointer rounded p-2"
                                            onClick={() => handleSelect(option)}
                                        >
                                            {option.title}
                                        </p>
                                    ))
                                ) : (
                                    <div className="text-muted-foreground p-3 text-center text-sm">
                                        No suggestions
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
            </div>
        );
    }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
