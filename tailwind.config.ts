// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ["Pretendard", "sans-serif"],
            },
            colors: {
                background: {
                    100: "#191919", // 헤더, 푸터 배경
                    200: "#373737", // 외곽선 배경
                    300: "#1F1F1F", // 페이지 내 컨테이너 배경
                    400: "#090909", // 페이지 전체 배경
                },
                font: {
                    100: "#FFFFFF", // 기본 텍스트
                    200: "#C4C4C4", // placeholder
                },
                primary: {
                    purple: {
                        100: "#A855F7", // 버튼 배경
                        200: "#9333EA", // 강조 텍스트
                        300: "#7E22CE", // 호버 버튼 배경
                    },
                    blue: {
                        100: "#2563EB",
                        200: "#2A4DD0",
                        300: "#1E3A8A",
                    },
                },
                line: {
                    100: "#F2F2F2", // 버튼 테두리
                    200: "#E6E6E6", // 컨테이너 테두리
                },
                state: {
                    error: "#FC4100", // 에러 색상
                },
            },
        },
    },
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    plugins: [],
};

export default config;
