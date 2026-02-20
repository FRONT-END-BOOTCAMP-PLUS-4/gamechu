"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/15 bg-background-300/30 py-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="flex flex-col items-center justify-between gap-16 md:flex-row md:items-end">
                    {/* 로고 및 소개 */}
                    <div className="flex flex-col items-center gap-2 md:items-start">
                        <h2>
                            <Link
                                href="/"
                                className="flex items-center transition-all duration-200 hover:scale-105"
                            >
                                <Image
                                    src="/icons/gamechu-logo.svg"
                                    alt="Gamechu 로고"
                                    width={160}
                                    height={100}
                                    priority
                                />
                            </Link>
                        </h2>
                        <p className="max-w-[300px] text-center text-sm leading-relaxed text-font-300 md:text-left">
                            당신의 인생 게임을 찾는 가장 완벽한 방법, <br />
                            겜추와 함께 새로운 모험을 시작하세요.
                        </p>
                    </div>

                    {/* 오른쪽 섹션: 팀 정보 */}
                    <div className="flex flex-col items-center md:items-end">
                        <h3 className="text-font-400 mb-2 text-xs font-bold uppercase tracking-[0.2em]">
                            Core Team
                        </h3>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium text-font-200">
                            {["권우진", "김태준", "박준선", "이규원"].map(
                                (name) => (
                                    <span
                                        key={name}
                                        className="cursor-default transition-colors hover:text-primary-purple-200"
                                    >
                                        {name}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단 바 */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 sm:flex-row">
                    <p className="text-font-400 text-[11px] font-medium uppercase tracking-widest">
                        © 2026 GAMECHU. ALL RIGHTS RESERVED.
                    </p>
                    <div className="text-font-400 flex gap-6 text-[11px] font-bold">
                        <button className="transition-colors hover:text-font-100">
                            이용약관
                        </button>
                        <button className="transition-colors hover:text-font-100">
                            개인정보처리방침
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
