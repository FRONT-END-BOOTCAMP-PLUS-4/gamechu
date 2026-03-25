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
        <div className="relative min-h-screen bg-background-400 font-sans text-font-100 flex items-center justify-center overflow-hidden">
            {/* Scanline overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-[100]"
                style={{
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                }}
            />
            {/* Grid background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
            {/* Vignette */}
            <div
                className="fixed inset-0 pointer-events-none z-[1]"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
                }}
            />
            {/* Purple orb */}
            <div
                className="fixed rounded-full pointer-events-none opacity-15"
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
                className="fixed rounded-full pointer-events-none opacity-15"
                style={{
                    width: 350,
                    height: 350,
                    background: "#ff3b5c",
                    filter: "blur(80px)",
                    bottom: -80,
                    left: -60,
                    animation: "drift 9s ease-in-out infinite alternate-reverse",
                }}
            />

            {/* Content */}
            <div
                className="relative z-10 flex flex-col items-center gap-8 px-5 py-10 max-w-[560px] w-full"
                style={{ animation: "fadeUp 0.6s ease both" }}
            >
                {/* SYSTEM ERROR badge */}
                <div
                    className="text-[11px] tracking-[0.15em] text-[#ff3b5c] bg-[rgba(255,59,92,0.1)] border border-[rgba(255,59,92,0.3)] px-4 py-2 rounded"
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
                    className="relative w-24 h-24 rounded-full bg-[#13131f] border-2 border-[#1e1e35] flex items-center justify-center text-[42px]"
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
                    <h1 className="text-2xl font-bold text-font-100 tracking-tight leading-snug">
                        앗, 뭔가 잘못됐어요!
                    </h1>
                    <p className="text-sm text-[#5a5a7a] leading-relaxed">
                        게임이 충돌했나봐요 😅
                        <br />
                        <em className="not-italic text-[rgba(232,232,240,0.5)]">
                            잠시 후 다시 시도하거나 홈으로 돌아가주세요.
                        </em>
                    </p>
                </div>

                {/* Terminal log */}
                <div
                    className="w-full bg-[#13131f] border border-[#1e1e35] rounded-lg overflow-hidden"
                    style={{ animation: "fadeUp 0.6s ease 0.2s both" }}
                >
                    <div className="bg-[#1a1a2a] px-3.5 py-2 flex items-center gap-1.5 border-b border-[#1e1e35]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                        <span className="ml-1.5 text-[11px] text-[#5a5a7a] font-mono">
                            gamechu — error log
                        </span>
                    </div>
                    <div className="px-4 py-3.5 font-mono text-[12px] leading-[1.8] space-y-0">
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#a0a0c0]">render [component]</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#ff3b5c]">UnhandledError: client component threw</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#4ade80]">error boundary caught ✓</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#a0a0c0]">
                                awaiting retry
                                <span
                                    className="inline-block w-2 h-3.5 bg-font-100 ml-0.5 align-middle"
                                    style={{ animation: "blink 1s step-end infinite" }}
                                />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div
                    className="flex gap-3 w-full"
                    style={{ animation: "fadeUp 0.6s ease 0.3s both" }}
                >
                    <button
                        onClick={reset}
                        className="flex-1 py-3.5 rounded-lg text-sm font-semibold text-white relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        style={{
                            background: "linear-gradient(135deg, #7c5cfc, #5a3ecc)",
                            boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
                        }}
                    >
                        🔄&nbsp;&nbsp;다시 시도
                    </button>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="flex-1 py-3.5 rounded-lg text-sm font-semibold text-[#5a5a7a] bg-[#13131f] border border-[#1e1e35] transition-all duration-200 hover:border-[#2e2e4e] hover:text-font-100 hover:-translate-y-0.5"
                    >
                        🏠&nbsp;&nbsp;홈으로
                    </button>
                </div>

                {/* Countdown timer */}
                <div
                    className="w-full flex flex-col gap-1.5"
                    style={{ animation: "fadeUp 0.6s ease 0.4s both" }}
                >
                    <p className="text-[11px] text-[#5a5a7a] text-center">
                        5초 후 자동으로 홈으로 이동합니다
                    </p>
                    <div className="w-full h-[3px] bg-[#1e1e35] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                background: "linear-gradient(90deg, #7c5cfc, #ff3b5c)",
                                animation: "countdown 5s linear both",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
