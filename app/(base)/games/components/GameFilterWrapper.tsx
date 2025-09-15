"use client";

import { useEffect } from "react";
import GameFilter from "./GameFilter";

interface GameFilterWrapperProps {
    genres: { id: number; name: string }[];
    themes: { id: number; name: string }[];
    platforms: { id: number; name: string }[];
    selectedTag?: { id: number; type: "genre" | "theme" };
    setSelectedTag: (tag?: { id: number; type: "genre" | "theme" }) => void;
    selectedPlatformId?: number;
    setSelectedPlatformId: (id?: number) => void;

    isOpen: boolean;
    onClose: () => void;
}

export default function GameFilterWrapper(props: GameFilterWrapperProps) {
    // 화면 크기 변경 감지 -> lg 이상이면 drawer 닫기
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                props.onClose();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [props, props.onClose]);

    return (
        <div className="relative">
            {/* 데스크탑 사이드바 */}
            <div className="hidden w-[300px] xl:block">
                <GameFilter {...props} />
            </div>

            {/* 모바일 Drawer (오버레이) */}
            {props.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex rounded-lg bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={() => props.onClose()}
                >
                    <div
                        className={`h-full transform bg-background-100 p-5 shadow-lg transition-transform duration-300 ${props.isOpen ? "translate-x-0" : "-translate-x-full"}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="mb-4 text-right text-primary-purple-200"
                            onClick={() => props.onClose()}
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
