// next.config.js
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
                            "script-src 'self'",
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: https:",
                            "font-src 'self'",
                            "connect-src 'self' ws: wss:",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
    images: {
        domains: ["cdn.cloudflare.steamstatic.com"], // 정적 도메인은 여기 유지
        remotePatterns: [
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
