"use client";

import React, { useState } from "react";
import { cn } from "@/utils/TailwindUtil";
import { ChevronDown } from "lucide-react";

type TagType = "genre" | "theme";

interface TagItem {
    id: number;
    name: string;
    type: TagType;
}

interface FilterItem {
    id: number;
    name: string;
}

type GameFilterProps = {
    selectedTag?: { id: number; type: "genre" | "theme" };
    setSelectedTag: (tag?: { id: number; type: "genre" | "theme" }) => void;
    selectedPlatformId?: number;
    setSelectedPlatformId: (id?: number) => void;
    genres: FilterItem[];
    themes: FilterItem[];
    platforms: FilterItem[];
}

const tagNameMap: Record<string, string> = {
    "4X (explore, expand, exploit, and exterminate)": "4X Strategy",
    "Point-and-click": "Point & Click",
    "Role-playing (RPG)": "RPG",
    Shooter: "FPS & Shooter",
    "Real Time Strategy (RTS)": "RTS",
    "Turn-based strategy (TBS)": "TBS",
    "Hack and slash/Beat 'em up": "Hack & Slash",
    Music: "Rhythm & Music",
    "PC (Microsoft Windows)": "PC",
};

export default function GameFilter({
    selectedTag,
    setSelectedTag,
    selectedPlatformId,
    setSelectedPlatformId,
    genres = [],
    themes = [],
    platforms = [],
}: GameFilterProps) {
    const [isGenreExpanded, setIsGenreExpanded] = useState(false);
    const [isPlatformExpanded, setIsPlatformExpanded] = useState(false);

    const genreAndTheme: TagItem[] = [
        ...genres.map((g) => ({ ...g, type: "genre" as const })),
        ...themes.map((t) => ({ ...t, type: "theme" as const })),
    ];

    const displayedTags = isGenreExpanded
        ? genreAndTheme
        : genreAndTheme.slice(0, 20);
    const displayedPlatforms = isPlatformExpanded
        ? platforms
        : platforms.slice(0, 10);

    return (
        <div className="custom-scroll max-h-full w-[300px] space-y-8 overflow-y-auto rounded-xl border border-white/5 bg-background-300 p-5 shadow-sm">
            {/* 장르 및 테마 */}
            <div>
                <h2 className="mb-4 text-base font-bold tracking-tight">
                    장르 및 테마
                </h2>
                <div className="flex flex-wrap gap-2">
                    {displayedTags.map((tag) => {
                        const isSelected =
                            selectedTag?.id === tag.id &&
                            selectedTag?.type === tag.type;

                        const displayName = tagNameMap[tag.name] || tag.name;

                        return (
                            <button
                                key={`${tag.type}-${tag.id}`}
                                onClick={() =>
                                    setSelectedTag(isSelected ? undefined : tag)
                                }
                                title={tag.name}
                                className={cn(
                                    "inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                                    isSelected
                                        ? "border-primary-purple-300 bg-primary-purple-300 text-white shadow-md shadow-primary-purple-300/20"
                                        : "border-line-100/10 bg-background-100 text-font-200 hover:border-primary-purple-200/50 hover:text-font-100"
                                )}
                            >
                                {displayName}
                            </button>
                        );
                    })}
                </div>

                {genreAndTheme.length > 20 && (
                    <button
                        onClick={() => setIsGenreExpanded((prev) => !prev)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-line-100/20 py-1.5 text-xs font-bold uppercase tracking-wider text-font-300 transition-all hover:border-line-100/40 hover:bg-white/5 hover:text-font-100 active:scale-[0.95]"
                    >
                        {isGenreExpanded ? "접기" : "더 보기"}
                        <ChevronDown
                            size={14}
                            className={cn(
                                "text-font-400 transition-transform duration-300 ease-in-out",
                                isGenreExpanded ? "rotate-180" : "rotate-0"
                            )}
                        />
                    </button>
                )}
            </div>

            <hr className="border-white/5" />

            {/* 플랫폼 */}
            <div>
                <h2 className="mb-4 text-base font-bold tracking-tight">
                    플랫폼
                </h2>
                <div className="flex flex-wrap gap-2">
                    {displayedPlatforms.map((platform) => {
                        const isSelected = selectedPlatformId === platform.id;
                        const displayName =
                            tagNameMap[platform.name] || platform.name;

                        return (
                            <button
                                key={platform.id}
                                onClick={() =>
                                    setSelectedPlatformId(
                                        isSelected ? undefined : platform.id
                                    )
                                }
                                className={cn(
                                    "inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                                    isSelected
                                        ? "border-primary-purple-300 bg-primary-purple-300 text-white shadow-md shadow-primary-purple-300/20"
                                        : "border-line-100/10 bg-background-100 text-font-200 hover:border-primary-purple-200/50 hover:text-font-100"
                                )}
                            >
                                {displayName}
                            </button>
                        );
                    })}
                </div>

                {platforms.length > 10 && (
                    <button
                        className="mt-4 flex w-full items-center justify-center gap-1 rounded-md py-2 text-xs font-semibold text-primary-purple-200 transition hover:bg-white/5"
                        onClick={() => setIsPlatformExpanded((prev) => !prev)}
                    >
                        {isPlatformExpanded ? "접기 ▲" : "플랫폼 더보기 ▼"}
                    </button>
                )}
            </div>
        </div>
    );
}
