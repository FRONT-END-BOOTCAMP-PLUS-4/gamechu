import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    use: {
        baseURL: process.env.BASE_URL ?? "http://localhost:3000",
        headless: true,
    },
    timeout: 30_000,
    reporter: process.env.CI ? "list" : "html",
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
