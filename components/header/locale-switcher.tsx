'use client';

import { useLocale } from 'next-intl';
import { Button } from '@/components/button/button';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const changeLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="flex flex-wrap gap-2">
            {routing.locales.map((l) => (
                <Button
                    key={l}
                    variant={locale === l ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeLocale(l)}
                    className="flex-1"
                >
                    {l.toUpperCase()}
                </Button>
            ))}
        </div>
    );
}
