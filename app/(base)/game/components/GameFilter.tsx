"use client";

import React from "react";
import { useState } from "react";
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
    platforms,
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
        <div className="w-[300px] bg-background-300 p-4 rounded-lg space-y-6">
            {/* 장르 및 테마 */}
            <div>
                <h2 className="text-h2 font-medium mb-2">장르 및 테마</h2>
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
                                    "text-caption px-2 py-1 rounded-full border",
                                    isSelected
                                        ? "bg-primary-purple-200 text-font-100 border-transparent"
                                        : "bg-background-100 text-font-200 border-line-200"
                                )}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>
                {genreAndTheme.length > 20 && (
                    <button
                        className="mt-2 text-primary-purple-200 underline"
                        onClick={() => setIsGenreExpanded((prev) => !prev)}
                    >
                        {isGenreExpanded ? "접기 ▲" : "더보기 ▼"}
                    </button>
                )}
            </div>

            {/* 플랫폼 */}
            <div>
                <h2 className="text-h2 font-medium mb-2">플랫폼</h2>
                <div className="flex flex-col gap-2">
                    {displayedPlatforms.map((platform) => (
                        <button
                            key={platform.id}
                            onClick={() =>
                                setSelectedPlatformId(
                                    selectedPlatformId === platform.id
                                        ? undefined
                                        : platform.id
                                )
                            }
                            className={cn(
                                "text-caption px-2 py-1 rounded-full border",
                                selectedPlatformId === platform.id
                                    ? "bg-primary-purple-200 text-font-100 border-transparent"
                                    : "bg-background-100 text-font-200 border-line-200"
                            )}
                        >
                            {platform.name}
                        </button>
                    ))}
                </div>
                {platforms.length > 10 && (
                    <button
                        className="mt-2 text-primary-purple-200 underline"
                        onClick={() => setIsPlatformExpanded((prev) => !prev)}
                    >
                        {isPlatformExpanded ? "접기 ▲" : "더보기 ▼"}
                    </button>
                )}
            </div>
        </div>
    );
}
