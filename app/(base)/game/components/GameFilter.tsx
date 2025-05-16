"use client";

import React, { useState } from "react";
import { cn } from "@/utils/tailwindUtil";

const genres = [
    "RPG",
    "액션",
    "전략",
    "어드벤처",
    "퍼즐",
    "스포츠",
    "슈팅",
    "레이싱",
    "MMORPG",
    "생존",
    "오픈월드",
    "시뮬레이션",
    "탑다운",
    "로그라이크",
    "플랫포머",
    "생존 호러",
    "서바이벌",
    "탑다운 슈팅",
    "턴제",
    "카드",
    "소셜",
    "디펜스",
    "방치형",
    "리듬",
    "VR",
];
const themes = [
    "공포",
    "SF",
    "판타지",
    "로맨스",
    "코미디",
    "전쟁",
    "역사",
    "음악",
    "드라마",
    "추리",
    "스릴러",
    "미스터리",
    "스팀펑크",
    "사이버펑크",
    "고딕",
    "호러",
    "애니메이션",
    "만화",
    "우주",
    "좀비",
    "해양",
    "고전",
    "고대",
    "미래",
    "동화",
    "신화",
    "우화",
];
const platforms = [
    "Switch",
    "PS5",
    "PC",
    "Xbox",
    "Mobile",
    "VR",
    "Steam",
    "Epic Games",
    "PlayStation Store",
    "Xbox Store",
    "Nintendo eShop",
    "Google Play Store",
    "Apple App Store",
    "Oculus Store",
    "GOG",
    "Origin",
    "Battle.net",
    "Uplay",
    "Humble Store",
    "itch.io",
    "Game Pass",
    "PlayStation Now",
];

export default function GameFilter() {
    const [isGenreExpanded, setIsGenreExpanded] = useState(false);
    const [isPlatformExpanded, setIsPlatformExpanded] = useState(false);
    const [selectedTag, setSelectedTag] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState("");

    const genreAndTheme = [...genres, ...themes];
    const displayedTags = isGenreExpanded
        ? genreAndTheme
        : genreAndTheme.slice(0, 20);
    const displayedPlatforms = isPlatformExpanded
        ? platforms
        : platforms.slice(0, 10);

    const handleSelectGenreTag = (tag: string) => {
        setSelectedTag((prev) => (prev === tag ? "" : tag));
    };

    const handleSelectPlatform = (platform: string) => {
        setSelectedPlatform((prev) => (prev === platform ? "" : platform));
    };

    return (
        <div className="w-[300px] bg-background-300 p-4 rounded-lg space-y-6">
            {/* 장르 및 테마 */}
            <div>
                <h2 className="text-h2 font-medium mb-2">장르 및 테마</h2>
                <div className="grid grid-cols-2 gap-2">
                    {displayedTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => handleSelectGenreTag(tag)}
                            className={cn(
                                "text-caption px-2 py-1 rounded-full border",
                                selectedTag === tag
                                    ? "bg-primary-purple-200 text-font-100 border-transparent"
                                    : "bg-background-100 text-font-200 border-line-200"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
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
                            key={platform}
                            onClick={() => handleSelectPlatform(platform)}
                            className={cn(
                                "text-caption px-2 py-1 rounded-full border",
                                selectedPlatform === platform
                                    ? "bg-primary-purple-200 text-font-100 border-transparent"
                                    : "bg-background-100 text-font-200 border-line-200"
                            )}
                        >
                            {platform}
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
