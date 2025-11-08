import { colors as defaultColors } from 'tailwindcss/defaultTheme';
import { colors } from "@mui/material";
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ...defaultColors,
                ...colors,
                gold: "#e9be6f",
                primary: {
                    50: "#EBF3FF",
                    150: "#E6F0FF",
                    100: "#D7E8FF",
                    200: "#AFD0FF",
                    300: "#87B8FF",
                    400: "#5E9EFF",
                    500: "#3183FF",
                    600: "#2260BE",
                    700: "#1A4F9E",
                    800: "#133F80",
                    900: "#0C2F63",
                    950: "#062048",
                },
                secondary: {
                    50: "#E2E7F0",
                    100: "#C6D0E2",
                    200: "#90A3C4",
                    300: "#5D77A6",
                    400: "#2D4C87",
                    500: "#001F68",
                    600: "#001959",
                    700: "#00144B",
                    800: "#000A30",
                    900: "#000318",
                    950: "#000004",
                },
            },
            fontFamily: {
                sora: ['Sora', 'sans-serif'],
            },
            fontSize: {
                'custom-sm': ['12px', { lineHeight: '15.6px' }],
            },
            letterSpacing: {
                tightest: '-0.02em',
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                },
            },
        },
    },
    plugins: [],
}