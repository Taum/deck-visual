import type { Config } from "tailwindcss";

const usedColors = ['red', 'amber', 'pink', 'purple', 'sky', 'lime']

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [{ pattern: /(bg|text)-(red|amber|pink|purple|sky|lime)-(50|100|800)/ }],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        'title': ['Lora', 'ui-serif', 'Georgia'],
      },
      boxShadow: {
        'card': '0 2px 4px 0px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'card': '0.5rem',
      },
      maxHeight: {
        'trimmed': '2.25rem',
      },
      maxWidth: {
        'visualarea': '75rem',
      },
      minWidth: {
        'visualarea': '75rem',
      },
    },
  },
  plugins: [],
};
export default config;
