/**
 * Playwright auth setup — saves NextAuth session cookies to e2e/.auth/user.json.
 *
 * Required env vars:
 *   E2E_EMAIL    — test account email
 *   E2E_PASSWORD — test account password
 *
 * If vars are not set, an empty auth state is written so dependent projects
 * don't crash; the auth spec tests themselves will skip via test.skip().
 */

import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;

    const dir = path.dirname(AUTH_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!email || !password) {
        // Write empty state so authenticated project can reference the file
        fs.writeFileSync(
            AUTH_FILE,
            JSON.stringify({ cookies: [], origins: [] })
        );
        return;
    }

    await page.goto("/log-in");
    await page
        .getByRole("textbox", { name: "이메일 주소를 입력하세요" })
        .fill(email);
    await page
        .getByRole("textbox", { name: "비밀번호를 입력하세요" })
        .fill(password);
    await page.getByRole("button", { name: "로그인" }).click();

    // Wait until redirected away from /log-in
    await page.waitForURL((url) => !url.pathname.includes("/log-in"), {
        timeout: 10_000,
    });

    await page.context().storageState({ path: AUTH_FILE });
});
