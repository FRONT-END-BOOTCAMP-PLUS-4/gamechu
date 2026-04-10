"use client";

import { useEffect } from "react";

type ErrorViewProps = {
    reset: () => void;
};

export default function ErrorView({ reset }: ErrorViewProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = "/";
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-400 font-sans text-font-100">
            {/* Scanline overlay */}
            <div
                className="pointer-events-none fixed inset-0 z-[100]"
                style={{
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                }}
            />
            {/* Grid background */}
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
            {/* Vignette */}
            <div
                className="pointer-events-none fixed inset-0 z-[1]"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
                }}
            />
            {/* Purple orb */}
            <div
                className="pointer-events-none fixed rounded-full opacity-15"
                style={{
                    width: 500,
                    height: 500,
                    background: "#7c5cfc",
                    filter: "blur(80px)",
                    top: -100,
                    right: -100,
                    animation: "drift 12s ease-in-out infinite alternate",
                }}
            />
            {/* Red orb */}
            <div
                className="pointer-events-none fixed rounded-full opacity-15"
                style={{
                    width: 350,
                    height: 350,
                    background: "#ff3b5c",
                    filter: "blur(80px)",
                    bottom: -80,
                    left: -60,
                    animation:
                        "drift 9s ease-in-out infinite alternate-reverse",
                }}
            />

            {/* Content */}
            <div
                className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-8 px-5 py-10"
                style={{ animation: "fadeUp 0.6s ease both" }}
            >
                {/* SYSTEM ERROR badge */}
                <div
                    className="rounded border border-[rgba(255,59,92,0.3)] bg-[rgba(255,59,92,0.1)] px-4 py-2 text-[11px] tracking-[0.15em] text-[#ff3b5c]"
                    style={{
                        fontFamily: "var(--font-press-start)",
                        textShadow: "0 0 12px #ff3b5c",
                        animation: "pulse-badge 2.5s ease-in-out infinite",
                    }}
                >
                    SYSTEM ERROR
                </div>

                {/* Icon */}
                <div
                    className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#1e1e35] bg-[#13131f] text-[42px]"
                    style={{ animation: "icon-shake 0.6s ease 0.3s both" }}
                >
                    🎮
                    <div
                        className="absolute rounded-full border border-[rgba(255,59,92,0.25)]"
                        style={{
                            inset: -6,
                            animation: "ring-pulse 2.5s ease-in-out infinite",
                        }}
                    />
                    <div
                        className="absolute rounded-full border border-[rgba(255,59,92,0.1)]"
                        style={{
                            inset: -14,
                            animation: "ring-pulse 2.5s ease-in-out infinite",
                            animationDelay: "0.4s",
                        }}
                    />
                </div>

                {/* Text */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <h1 className="text-2xl font-bold leading-snug tracking-tight text-font-100">
                        앗, 뭔가 잘못됐어요!
                    </h1>
                    <p className="text-sm leading-relaxed text-[#5a5a7a]">
                        게임이 충돌했나봐요 😅
                        <br />
                        <em className="not-italic text-[rgba(232,232,240,0.5)]">
                            잠시 후 다시 시도하거나 홈으로 돌아가주세요.
                        </em>
                    </p>
                </div>

                {/* Terminal log */}
                <div
                    className="w-full overflow-hidden rounded-lg border border-[#1e1e35] bg-[#13131f]"
                    style={{ animation: "fadeUp 0.6s ease 0.2s both" }}
                >
                    <div className="flex items-center gap-1.5 border-b border-[#1e1e35] bg-[#1a1a2a] px-3.5 py-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                        <span className="ml-1.5 font-mono text-[11px] text-[#5a5a7a]">
                            gamechu — error log
                        </span>
                    </div>
                    <div className="space-y-0 px-4 py-3.5 font-mono text-[12px] leading-[1.8]">
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#a0a0c0]">
                                render [component]
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#ff3b5c]">
                                UnhandledError: client component threw
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#4ade80]">
                                error boundary caught ✓
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#a0a0c0]">
                                awaiting retry
                                <span
                                    className="ml-0.5 inline-block h-3.5 w-2 bg-font-100 align-middle"
                                    style={{
                                        animation: "blink 1s step-end infinite",
                                    }}
                                />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div
                    className="flex w-full gap-3"
                    style={{ animation: "fadeUp 0.6s ease 0.3s both" }}
                >
                    <button
                        onClick={reset}
                        className="relative flex-1 overflow-hidden rounded-lg py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        style={{
                            background:
                                "linear-gradient(135deg, #7c5cfc, #5a3ecc)",
                            boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
                        }}
                    >
                        🔄&nbsp;&nbsp;다시 시도
                    </button>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="flex-1 rounded-lg border border-[#1e1e35] bg-[#13131f] py-3.5 text-sm font-semibold text-[#5a5a7a] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2e2e4e] hover:text-font-100"
                    >
                        🏠&nbsp;&nbsp;홈으로
                    </button>
                </div>

                {/* Countdown timer */}
                <div
                    className="flex w-full flex-col gap-1.5"
                    style={{ animation: "fadeUp 0.6s ease 0.4s both" }}
                >
                    <p className="text-center text-[11px] text-[#5a5a7a]">
                        5초 후 자동으로 홈으로 이동합니다
                    </p>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#1e1e35]">
                        <div
                            className="h-full rounded-full"
                            style={{
                                background:
                                    "linear-gradient(90deg, #7c5cfc, #ff3b5c)",
                                animation: "countdown 5s linear both",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
