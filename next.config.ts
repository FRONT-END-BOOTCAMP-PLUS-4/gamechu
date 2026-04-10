// next.config.ts
const nextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline'",
                            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
                            "img-src 'self' data: https:",
                            "font-src 'self' https://cdn.jsdelivr.net",
                            "connect-src 'self' ws: wss:",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.cloudflare.steamstatic.com",
            },
            {
                protocol: "https",
                hostname: "i.imgur.com",
            },
            {
                protocol: "https",
                hostname: "ko.imgbb.com",
            },
            {
                protocol: "https",
                hostname: "i.namu.wiki",
            },
            {
                protocol: "https",
                hostname: "images.igdb.com",
            },
        ],
    },
};

export default nextConfig;
