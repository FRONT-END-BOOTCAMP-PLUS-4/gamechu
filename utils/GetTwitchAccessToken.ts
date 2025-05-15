//utils/GetTwitchAccessToken.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export async function getTwitchAccessToken(): Promise<string> {
    const clientId = process.env.TWITCH_CLIENT_ID!;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET!;

    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
        }),
    });

    if (!tokenRes.ok) {
        throw new Error(
            `Failed to get Twitch token: ${tokenRes.status} - ${tokenRes.text}`
        );
    }

    const tokenData = await tokenRes.json();
    return tokenData.access_token;
}
