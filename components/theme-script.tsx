export function ThemeScript() {
    const themeScript = `
        (() => {
            try {
                const theme = JSON.parse(localStorage.getItem('foslog-storage') || '{}').state?.theme;
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                } else {
                    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                    if (mediaQuery.matches) {
                        document.documentElement.classList.add('dark');
                        document.documentElement.setAttribute('data-theme', 'dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.setAttribute('data-theme', 'light');
                    }
                }
            } catch (e) {
                // Ignore errors
            }
        })();
    `;

    return (
        <script
            dangerouslySetInnerHTML={{ __html: themeScript }}
            suppressHydrationWarning
        />
    );
}
