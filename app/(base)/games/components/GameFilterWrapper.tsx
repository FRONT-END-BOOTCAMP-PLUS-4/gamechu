"use client";

import { useEffect } from "react";
import GameFilter from "./GameFilter";
import { X } from "lucide-react";

type GameFilterWrapperProps = {
    genres: { id: number; name: string }[];
    themes: { id: number; name: string }[];
    platforms: { id: number; name: string }[];
    selectedTag?: { id: number; type: "genre" | "theme" };
    setSelectedTag: (tag?: { id: number; type: "genre" | "theme" }) => void;
    selectedPlatformId?: number;
    setSelectedPlatformId: (id?: number) => void;

    isOpen: boolean;
    onClose: () => void;
};

export default function GameFilterWrapper(props: GameFilterWrapperProps) {
    const { onClose } = props;

    // 화면 크기 변경 감지 -> lg 이상이면 drawer 닫기
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                onClose();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [onClose]);

    return (
        <div className="relative">
            {/* 데스크탑 사이드바 */}
            <div className="hidden w-[300px] xl:block">
                <GameFilter {...props} />
            </div>

            {/* 필터 Drawer, 애니메이션 적용 */}
            <div
                className={`fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    props.isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={() => props.onClose()}
            >
                <div
                    className={`flex h-full w-[320px] transform flex-col bg-background-300 shadow-2xl transition-transform duration-300 ${
                        props.isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between border-b border-white/5 p-5">
                        <span className="text-xl font-bold text-font-100">
                            게임 필터
                        </span>
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-font-200 transition hover:bg-white/10"
                            onClick={() => props.onClose()}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="p-2">
                            <GameFilter {...props} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
