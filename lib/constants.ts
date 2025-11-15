export const LOCALES = ['en', 'es', 'ca'] as const;

export type Locale = (typeof LOCALES)[number];
