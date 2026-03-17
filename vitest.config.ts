import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./tests/setup.ts"],
        exclude: ["node_modules", "e2e/**"],
        coverage: {
            provider: "v8",
        },
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
});
