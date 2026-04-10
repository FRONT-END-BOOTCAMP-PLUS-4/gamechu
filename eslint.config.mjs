import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [
            "prisma/generated/**",
            ".next/**",
            "coverage/**",
            "next-env.d.ts",
            "playwright-report/**",
            "test-results/**",
        ],
    },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    eslintConfigPrettier,
];

export default eslintConfig;
