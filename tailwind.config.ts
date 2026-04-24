import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        screens: {
            'xs': '320px',    // Compact Mobile
            'sm': '375px',    // Standard Mobile
            'ms': '430px',    // Large Mobile
            'md': '768px',    // Tablet
            'lg': '1024px',   // Desktop/Landscape
            'xl': '1280px',   // Large Desktop
            '2xl': '1536px',
        },
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                accent: "var(--accent)",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
                serif: ["var(--font-serif)", "serif"],
                cursive: ["var(--font-cursive)", "cursive"],
                libre: ["var(--font-libre-bodoni)", "serif"],
                better: ["var(--font-better-together)", "cursive"],
            },
            screens: {
                'h-short': { 'raw': '(max-height: 640px)' },
                'h-standard': { 'raw': '(min-height: 641px) and (max-height: 850px)' },
                'h-tall': { 'raw': '(min-height: 851px)' },
            },
        },
    },
    plugins: [],
};
export default config;
