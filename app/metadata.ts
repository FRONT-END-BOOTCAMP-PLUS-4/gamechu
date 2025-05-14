import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "겜추 | 게임 리뷰 & 추천",
        template: "%s | 겜추",
    },
    description: "게임 리뷰, 투기장, 큐레이션 추천까지 겜추에서 시작하세요.",
    keywords: ["게임 추천", "리뷰", "겜추", "투기장", "gamechu"],
    authors: [{ name: "겜추" }],
    icons: {},
    openGraph: {
        title: "겜추 | 게임 리뷰 & 추천",
        description: "게임 리뷰, 추천, 토론 플랫폼",

        siteName: "겜추",
        images: [],
        locale: "ko_KR",
        type: "website",
    },
    formatDetection: {
        telephone: false,
        email: false,
        address: false,
    },
    manifest: "/site.webmanifest",
};
