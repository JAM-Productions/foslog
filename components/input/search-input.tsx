import * as React from 'react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { MediaType } from '@prisma/client';
import {
    LoaderCircle,
    Tv,
    Gamepad2,
    Book,
    Music,
    StickyNote,
    Clapperboard,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export interface Suggestion {
    title: string;
    type: MediaType;
    year: number | null;
    poster: string | null;
    description: string;
    genre: string[];
}

export interface SearchInputProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        'onSelect' | 'value' | 'onChange'
    > {
    variant?: 'default' | 'outline' | 'filled';
    inputSize?: 'default' | 'sm' | 'lg';
    selectedMediaType: string;
    setSelectedMedia: (media: Suggestion | null) => void;
    setMediaTitle: (title: string) => void;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const getMediaTypeIcon = (type: MediaType) => {
    switch (type) {
        case 'FILM':
            return Clapperboard;
        case 'SERIES':
            return Tv;
        case 'GAME':
            return Gamepad2;
        case 'BOOK':
            return Book;
        case 'MUSIC':
            return Music;
        default:
            return StickyNote;
    }
};

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            className,
            variant = 'default',
            inputSize = 'default',
            setSelectedMedia,
            setMediaTitle,
            selectedMediaType,
            value,
            onChange,
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
                setSelectedMedia(null);
                const getSearchInputData = setTimeout(async () => {
                    try {
                        setLoading(true);
                        const url = new URL(
                            '/api/search',
                            window.location.origin
                        );
                        Object.entries({
                            mediatype: selectedMediaType,
                            mediatitle: value.trim(),
                        }).forEach(([key, val]) => {
                            url.searchParams.append(key, val);
                        });

                        const response = await fetch(url.toString());
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const data = await response.json();

                        if (Array.isArray(data)) {
                            const uniqueData = data.filter(
                                (item, index, self) =>
                                    index ===
                                    self.findIndex(
                                        (t) =>
                                            t.title === item.title &&
                                            t.year === item.year &&
                                            t.type === item.type
                                    )
                            );
                            setSuggestions(uniqueData);
                            if (isMediaTitleInData(uniqueData)) {
                                setSelectedMedia(getMediaInData(uniqueData));
                            } else {
                                setSelectedMedia(null);
                            }
                        } else {
                            setSuggestions([]);
                            setSelectedMedia(null);
                        }
                    } catch (error) {
                        console.error('Error fetching suggestions:', error);
                        setSuggestions([]);
                        setSelectedMedia(null);
                    } finally {
                        setLoading(false);
                    }
                }, 400);

                return () => clearTimeout(getSearchInputData);
            } else {
                setSuggestions([]);
                setSelectedMedia(null);
            }
        }, [value, setSelectedMedia, selectedMediaType]);

        const handleSelect = (suggestion: Suggestion) => {
            setMediaTitle(suggestion.title);
            setSelectedMedia(suggestion);
            setIsOpen(false);
        };

        const variants = {
            default: 'border border-input bg-background',
            outline: 'border-2 border-input bg-transparent',
            filled: 'border-0 bg-muted',
        };

        const sizes = {
            default: 'h-10 px-4 py-2',
            sm: 'h-8 px-2 py-1 text-base',
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
                    onFocus={() => setIsOpen(true)}
                    {...props}
                />
                {isOpen &&
                    (loading ||
                        suggestions.length > 0 ||
                        (suggestions.length === 0 && value)) && (
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
                                    suggestions.map((option) => (
                                        <div
                                            key={`${option.title}-${option.year}-${option.type}`}
                                            className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded p-2"
                                            onClick={() => handleSelect(option)}
                                        >
                                            <div className="bg-muted flex h-12 w-8 shrink-0 items-center justify-center overflow-hidden rounded">
                                                {option.poster ? (
                                                    <Image
                                                        src={option.poster}
                                                        alt={option.title}
                                                        width={32}
                                                        height={48}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="bg-muted flex h-full w-full items-center justify-center">
                                                        {React.createElement(
                                                            getMediaTypeIcon(
                                                                option.type
                                                            ),
                                                            {
                                                                className:
                                                                    'text-muted-foreground h-4.5 w-4.5',
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="truncate font-medium">
                                                    {option.title}
                                                </span>
                                                {option.year && (
                                                    <span className="text-muted-foreground text-sm">
                                                        {option.year}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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
