// GameFilterWrapper.tsx
"use client";

import { useState } from "react";
import GameFilter from "./GameFilter";

interface GameFilterWrapperProps {
    genres: { id: number; name: string }[];
    themes: { id: number; name: string }[];
    platforms: { id: number; name: string }[];
    selectedTag?: { id: number; type: "genre" | "theme" };
    setSelectedTag: (tag?: { id: number; type: "genre" | "theme" }) => void;
    selectedPlatformId?: number;
    setSelectedPlatformId: (id?: number) => void;
}

export default function GameFilterWrapper(props: GameFilterWrapperProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* 모바일 전용 토글 버튼 */}
            <button
                className="rounded-lg bg-primary-purple-200 px-4 py-2 text-white xl:hidden"
                onClick={() => setIsOpen(true)}
            >
                필터 열기
            </button>

            {/* 데스크탑 사이드바 */}
            <div className="hidden w-[300px] xl:block">
                <GameFilter {...props} />
            </div>

            {/* 모바일 Drawer (오버레이) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
                    <div className="h-full w-[80%] max-w-[320px] bg-background-100 p-5 shadow-lg">
                        <button
                            className="mb-4 text-right text-primary-purple-200"
                            onClick={() => setIsOpen(false)}
                        >
                            닫기 ✕
                        </button>
                        <GameFilter {...props} />
                    </div>
                </div>
            )}
        </div>
    );
}
