export const LOCALES = ['en', 'es', 'ca'] as const;
export type Locale = (typeof LOCALES)[number];
export const FOSLOG_URL = 'https://www.foslog.com';

// Lists
export const MIN_LIST_NAME_LENGTH = 2;
export const MAX_LIST_NAME_LENGTH = 60;
export const MAX_LIST_DESCRIPTION_LENGTH = 500;
/** Images are stored base64-encoded in the `lists.image` column. */
export const MAX_LIST_IMAGE_LENGTH = 700 * 1024;
export const MAX_LISTS_PER_USER = 30;
/** Lists shown in the profile / "other lists" previews before "see more". */
export const LISTS_PREVIEW_LIMIT = 5;
/** Media items per page inside a list. */
export const LIST_MEDIA_PAGE_SIZE = 15;

// Feed
/** Only reviews posted within this many days reach the feed. */
export const FEED_WINDOW_DAYS = 30;
/** Reviews shown in the home feed section before "see more". */
export const FEED_PREVIEW_LIMIT = 12;
/** Reviews per page on the feed screen. */
export const FEED_PAGE_SIZE = 12;
