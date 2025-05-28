import { execSync } from "child_process";

const limit = 500;
const maxOffset = 100000;
const seedScript = "npx tsx prisma/seed.ts";

for (let offset = 20000; offset <= maxOffset; offset += limit) {
    console.log(`Fetching games with offset: ${offset}`);

    try {
        execSync(`${seedScript} ${offset}`, { stdio: "inherit" });
    } catch (err) {
        console.error(`❌ Error at offset ${offset}:`, err);
    }
}
