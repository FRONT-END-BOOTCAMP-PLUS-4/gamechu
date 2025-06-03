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
        <div className="w-[300px] bg-background-300 p-5 rounded-xl shadow-sm space-y-4">
            {/* 장르 및 테마 */}
            <div>
                <h2 className="text-h2 font-semibold mb-3">장르 및 테마</h2>
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
                                    "px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150",
                                    isSelected
                                        ? "bg-primary-purple-300 text-white"
                                        : "hover:bg-primary-purple-100 text-font-200"
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
                            className="flex items-center gap-1 px-3 py-1  text-primary-purple-200 font-medium hover:bg-background-200 rounded-md transition"
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
                <h2 className="text-h2 font-semibold mb-3">플랫폼</h2>
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
                                    "px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150",
                                    isSelected
                                        ? "bg-primary-purple-300 text-white"
                                        : "hover:bg-primary-purple-100 text-font-200"
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
                            className="flex items-center gap-1 px-3 py-1 text-sm text-primary-purple-200 font-medium hover:bg-background-200 rounded-md transition"
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
