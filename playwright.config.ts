import { defineConfig } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
    testDir: "./e2e",
    use: {
        baseURL: BASE_URL,
        headless: true,
    },
    timeout: 30_000,
    reporter: process.env.CI ? "list" : "html",
    webServer: {
        command: "npm run dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
    projects: [
        {
            name: "setup",
            testMatch: "**/auth.setup.ts",
        },
        {
            name: "unauthenticated",
            testIgnore: ["**/auth.setup.ts", "**/game-detail-auth.spec.ts"],
        },
        {
            name: "authenticated",
            use: { storageState: "e2e/.auth/user.json" },
            dependencies: ["setup"],
            testMatch: "**/game-detail-auth.spec.ts",
        },
    ],
});
