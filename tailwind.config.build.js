/** @type {import('tailwindcss').Config} */
export default {
    // Only scan package source files - not consumer's project
    content: ['./src/**/*.{ts,tsx}'],

    theme: {
        extend: {
            // shadcn/ui maia preset with zinc base and amber theme
            colors: {
                // Zinc base colors (already in Tailwind, but explicit for clarity)
                zinc: {
                    50: '#fafafa',
                    100: '#f4f4f5',
                    200: '#e4e4e7',
                    300: '#d4d4d8',
                    400: '#a1a1aa',
                    500: '#71717a',
                    600: '#52525b',
                    700: '#3f3f46',
                    800: '#27272a',
                    900: '#18181b',
                    950: '#09090b',
                },
                // Amber accent colors
                amber: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    950: '#451a03',
                },
                // Red for stop button and errors
                red: {
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                },
            },
            // Small radius from shadcn preset
            borderRadius: {
                sm: '0.125rem',
            },
            // Ring offset for focus states
            ringOffsetColor: {
                'zinc-900': '#18181b',
            },
        },
    },

    plugins: [],
}
