import * as React from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { MediaType } from '@prisma/client';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface Suggestion {
    title: string;
    type: MediaType;
    year: number;
    poster: string;
    description: string;
}

export interface SearchInputProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        'onSelect' | 'value' | 'onChange'
    > {
    variant?: 'default' | 'outline' | 'filled';
    inputSize?: 'default' | 'sm' | 'lg';
    apiUrl: string;
    apiParams?: Record<string, string>;
    debounceMs?: number;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchResults?: (results: Suggestion[]) => void;
    onAutoSelect?: (suggestion: Suggestion | null) => void;
    onSelect: (suggestion: Suggestion) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            className,
            variant = 'default',
            inputSize = 'default',
            apiUrl,
            apiParams = {},
            debounceMs = 300,
            value,
            onChange,
            onSearchResults,
            onAutoSelect,
            onFocus,
            onSelect,
            ...props
        },
        ref
    ) => {
        const tSearchInput = useTranslations('SearchInput');

        const searchInputRef = React.useRef<HTMLDivElement>(null);
        const [isOpen, setIsOpen] = React.useState(false);
        const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
        const [loading, setLoading] = React.useState<boolean>(false);

        useClickOutside(searchInputRef, isOpen, setIsOpen);

        React.useEffect(() => {
            const isMediaTitleInData = (
                searchResults: Suggestion[]
            ): boolean => {
                return searchResults.some(
                    (result: Suggestion) => result.title === value?.trim()
                );
            };

            const getMediaInData = (
                searchResults: Suggestion[]
            ): Suggestion | null => {
                const foundMedia = searchResults.find(
                    (result: Suggestion) => result.title === value?.trim()
                );
                return foundMedia || null;
            };

            if (value?.trim()) {
                setSuggestions([]);
                onAutoSelect?.(null);
                const getSearchInputData = setTimeout(async () => {
                    setLoading(true);

                    const url = new URL(apiUrl, window.location.origin);
                    Object.entries(apiParams).forEach(([key, val]) => {
                        url.searchParams.append(key, val);
                    });

                    const response = await fetch(url.toString());
                    const data = await response.json();
                    setSuggestions(data);
                    onSearchResults?.(data);
                    if (isMediaTitleInData(data)) {
                        onAutoSelect?.(getMediaInData(data));
                    } else {
                        onAutoSelect?.(null);
                    }
                    setLoading(false);
                }, debounceMs);

                return () => clearTimeout(getSearchInputData);
            } else {
                setSuggestions([]);
                onSearchResults?.([]);
                onAutoSelect?.(null);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [apiUrl, JSON.stringify(apiParams), value]);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsOpen(true);
            onFocus?.(e);
        };

        const handleSelect = (suggestion: Suggestion) => {
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
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    {...props}
                />
                {isOpen &&
                    (loading ||
                        suggestions.length > 0 ||
                        (!loading && suggestions.length === 0 && value)) && (
                        <div className="bg-background absolute top-12 right-0 left-0 z-50 max-h-60 overflow-y-auto rounded-lg border shadow-lg">
                            <div className="p-1">
                                {loading ? (
                                    <div className="flex items-center justify-center p-3">
                                        <LoaderCircle className="text-primary animate-spin" />
                                        <span className="text-muted-foreground ml-2">
                                            {tSearchInput('loading')}
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
                                    <div className="text-muted-foreground p-3 text-center">
                                        {tSearchInput('noSuggestions')}
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
