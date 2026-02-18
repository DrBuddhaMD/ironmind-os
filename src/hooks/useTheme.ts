import { useState, useEffect } from 'react';

export function useTheme(initialTheme?: any) {
    const defaultTheme = {
        color: '#22c55e', // Green-500
        bgColor: '#000000',
        spacing: '1rem',
        fontSize: '1rem', // Default font size
    };

    const [theme, setTheme] = useState(initialTheme || defaultTheme);

    // Save theme to DB on change (debounced or just on command)
    // Since we change theme via command, we can just trigger save in the handler to avoid effect loops
    const saveTheme = async (newTheme: any) => {
        try {
            await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTheme)
            });
        } catch (e) {
            console.error("Failed to save theme", e);
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.color);
        root.style.setProperty('--color-bg', theme.bgColor);
        root.style.setProperty('--spacing-unit', theme.spacing);
        root.style.setProperty('--font-size', theme.fontSize);
    }, [theme]);

    const handleThemeCommand = (cmd: string): string | null => {
        const parts = cmd.trim().split(' ');
        const command = parts[0].toLowerCase();
        const value = parts[1];

        let newTheme = { ...theme };
        let updated = false;

        if (command === '/color' && value) {
            newTheme.color = value;
            updated = true;
        }
        if (command === '/bgcolor' && value) {
            newTheme.bgColor = value;
            updated = true;
        }
        if (command === '/spacing' && value) {
            newTheme.spacing = value;
            updated = true;
        }
        if (command === '/fontsize' && value) {
            newTheme.fontSize = value;
            updated = true;
        }

        if (updated) {
            setTheme(newTheme);
            saveTheme(newTheme); // Trigger save
            return `Theme updated.`;
        }
        return null;
    };

    return { theme, handleThemeCommand };
}
