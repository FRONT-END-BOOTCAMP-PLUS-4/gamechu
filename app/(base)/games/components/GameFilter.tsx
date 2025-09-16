"use client";

import React, { useState } from "react";
import { cn } from "@/utils/tailwindUtil";

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

interface GameFilterProps {
    selectedTag?: { id: number; type: "genre" | "theme" };
    setSelectedTag: (tag?: { id: number; type: "genre" | "theme" }) => void;
    selectedPlatformId?: number;
    setSelectedPlatformId: (id?: number) => void;
    genres: FilterItem[];
    themes: FilterItem[];
    platforms: FilterItem[];
}

export default function GameFilter({
    selectedTag,
    setSelectedTag,
    selectedPlatformId,
    setSelectedPlatformId,
    genres,
    themes,
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
        <div className="custom-scroll max-h-full w-[300px] space-y-4 overflow-y-auto rounded-xl bg-background-300 p-5 shadow-sm">
            {/* 장르 및 테마 */}
            <div>
                <h2 className="mb-3 text-h2 font-semibold">장르 및 테마</h2>
                <div className="grid grid-cols-2 gap-2">
                    {displayedTags.map((tag) => {
                        const isSelected =
                            selectedTag?.id === tag.id &&
                            selectedTag?.type === tag.type;

                        return (
                            <button
                                key={`${tag.type}-${tag.id}`}
                                onClick={() =>
                                    setSelectedTag(isSelected ? undefined : tag)
                                }
                                className={cn(
                                    "rounded-md px-3 py-1 text-sm font-medium transition-colors duration-150",
                                    isSelected
                                        ? "bg-primary-purple-300 text-white"
                                        : "text-font-200 hover:bg-primary-purple-100"
                                )}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>

                {genreAndTheme.length > 20 && (
                    <div className="mt-3 flex justify-center">
                        <button
                            className="flex items-center gap-1 rounded-md px-3 py-1 font-medium text-primary-purple-200 transition hover:bg-background-200"
                            onClick={() => setIsGenreExpanded((prev) => !prev)}
                        >
                            {isGenreExpanded ? "접기" : "더보기"}
                            <span className="text-xs">
                                {isGenreExpanded ? "▲" : "▼"}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* 플랫폼 */}
            <div>
                <h2 className="mb-3 text-h2 font-semibold">플랫폼</h2>
                <div className="flex flex-col gap-2">
                    {displayedPlatforms.map((platform) => {
                        const isSelected = selectedPlatformId === platform.id;
                        return (
                            <button
                                key={platform.id}
                                onClick={() =>
                                    setSelectedPlatformId(
                                        isSelected ? undefined : platform.id
                                    )
                                }
                                className={cn(
                                    "rounded-md px-3 py-1 text-sm font-medium transition-colors duration-150",
                                    isSelected
                                        ? "bg-primary-purple-300 text-white"
                                        : "text-font-200 hover:bg-primary-purple-100"
                                )}
                            >
                                {platform.name}
                            </button>
                        );
                    })}
                </div>

                {platforms.length > 10 && (
                    <div className="mt-3 flex justify-center">
                        <button
                            className="flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-primary-purple-200 transition hover:bg-background-200"
                            onClick={() =>
                                setIsPlatformExpanded((prev) => !prev)
                            }
                        >
                            {isPlatformExpanded ? "접기" : "더보기"}
                            <span className="text-xs">
                                {isPlatformExpanded ? "▲" : "▼"}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
