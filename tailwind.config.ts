import type { Config } from "tailwindcss";

const config: Config = {
    theme: {
        extend: {
            animation: {
                "fade-in-left": "fadeInLeft 0.8s ease-out forwards",
                "fade-in-right": "fadeInRight 0.8s ease-out forwards",
                "fade-in-up": "fadeInUp 0.8s ease-out forwards",
                "slow-pan": "pan 60s linear infinite",
                "fade-in": "fadeIn 0.8s ease-out",
                "border-flow": "borderFlow 8s linear infinite",
                "gradient-xy": "gradientXy 8s ease infinite",
                "fade-in-up-strong": "fadeInUpStrong 0.8s ease-out forwards",
                "fade-in-left-strong":
                    "fadeInLeftStrong 0.8s ease-out forwards",
                "fade-in-right-strong":
                    "fadeInRightStrong 0.8s ease-out forwards",
                typing: "typing 5s steps(60, end) forwards",
                shake: "shake 0.4s ease-in-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeInLeft: {
                    "0%": { opacity: "0", transform: "translateX(-20px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                fadeInRight: {
                    "0%": { opacity: "0", transform: "translateX(20px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeInUpStrong: {
                    "0%": { opacity: "0", transform: "translateY(100px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeInLeftStrong: {
                    "0%": { opacity: "0", transform: "translateX(-100px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },

                fadeInRightStrong: {
                    "0%": { opacity: "0", transform: "translateX(100px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                pan: {
                    "0%": { backgroundPosition: "0% 50%" },
                    "100%": { backgroundPosition: "100% 50%" },
                },
                borderFlow: {
                    "0%": {
                        backgroundPosition: "0% 50%",
                    },
                    "100%": {
                        backgroundPosition: "200% 50%",
                    },
                },
                typing: {
                    "0%": { width: "0", opacity: "0" },
                    "1%": { opacity: "1" },
                    "100%": { width: "100vw", opacity: "1" },
                },
                gradientXy: {
                    "0%": { backgroundPosition: "0% 0%" },
                    "50%": { backgroundPosition: "100% 100%" },
                    "100%": { backgroundPosition: "0% 0%" },
                },
                shake: {
                    "0%": { transform: "translateX(0)" },
                    "20%": { transform: "translateX(-8px)" },
                    "40%": { transform: "translateX(8px)" },
                    "60%": { transform: "translateX(-2px)" },
                    "80%": { transform: "translateX(2px)" },
                    "100%": { transform: "translateX(0)" },
                },
            },
            fontSize: {
                headline: ["32px", "40px"], // 큰제목
                h2: ["24px", "32px"], // 소제목
                h3: ["20px", "28px"],
                body: ["16px", "24px"], // 본문
                caption: ["12px", "16px"], // 캡션, 에러 메시지 등
                button: ["14px", "20px"], // 버튼 텍스트
            },

            fontFamily: {
                sans: ["Pretendard", "sans-serif"],
            },
            colors: {
                background: {
                    100: "#191919", // 헤더, 푸터 배경
                    200: "#373737", // 인풋 배경
                    300: "#1F1F1F", // 페이지 내 컨테이너 배경
                    400: "#090909", // 페이지 전체 배경
                },
                font: {
                    100: "#FFFFFF", // 기본 텍스트
                    200: "#C4C4C4", // placeholder
                    300: "#a5a5a5", // 보조 텍스트
                },
                primary: {
                    purple: {
                        100: "#A855F7", // 버튼 비활성화
                        200: "#9333EA", // 버튼 배경, 기본 색상
                        300: "#7E22CE", // 호버 버튼 배경
                        400: "rgba(147, 51, 234, 0.2)", // 채팅 배경
                    },
                    blue: {
                        100: "#2563EB", // 버튼 비활성화
                        200: "#2A4DD0", // 버튼 배경
                        300: "#1E3A8A", // 호버 버튼 배경
                        400: "rgba(30, 58, 138, 0.2)", // 채팅 배경
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
