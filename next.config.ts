import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["cdn.cloudflare.steamstatic.com"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.imgur.com, ko.imgbb.com",
            },
        ],
    },
};

export default nextConfig;
