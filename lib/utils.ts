type ClassValue =
    | string
    | number
    | boolean
    | undefined
    | null
    | ClassValue[]
    | Record<string, unknown>;

// Basic Tailwind class conflict resolution
const tailwindClassGroups = {
    // Padding
    p: /^p-/,
    px: /^px-/,
    py: /^py-/,
    pt: /^pt-/,
    pr: /^pr-/,
    pb: /^pb-/,
    pl: /^pl-/,
    // Margin
    m: /^m-/,
    mx: /^mx-/,
    my: /^my-/,
    mt: /^mt-/,
    mr: /^mr-/,
    mb: /^mb-/,
    ml: /^ml-/,
    // Width & Height
    w: /^w-/,
    h: /^h-/,
    // Text size
    text: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
    // Font weight
    font: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    // Display
    block: /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/,
};

function resolveTailwindConflicts(classes: string[]): string[] {
    const classMap = new Map<string, string>();

    for (const cls of classes) {
        let matched = false;

        // Check each class group for conflicts
        for (const [group, pattern] of Object.entries(tailwindClassGroups)) {
            if (pattern.test(cls)) {
                // For conflicting classes, keep the last one
                classMap.set(group, cls);
                matched = true;
                break;
            }
        }

        // If no conflict detected, keep the class
        if (!matched) {
            classMap.set(cls, cls);
        }
    }

    return Array.from(classMap.values());
}

export function cn(...inputs: ClassValue[]): string {
    const classes: string[] = [];

    for (const input of inputs) {
        if (!input) continue;

        if (typeof input === 'string' || typeof input === 'number') {
            classes.push(String(input));
        } else if (Array.isArray(input)) {
            const nested = cn(...input);
            if (nested) classes.push(nested);
        } else if (typeof input === 'object') {
            for (const [key, value] of Object.entries(input)) {
                if (value) classes.push(key);
            }
        }
    }

    // Split into individual classes, resolve conflicts, and rejoin
    const allClasses = classes.join(' ').split(/\s+/).filter(Boolean);
    const resolvedClasses = resolveTailwindConflicts(allClasses);

    return resolvedClasses.join(' ');
}
