"use client";

import React, { useEffect, useState } from "react";
import GameCardList from "./components/GameCardList";
import GameFilter from "./components/GameFilter";
import SearchBar from "./components/SearchBar";
import Pager from "@/app/components/Pager";
import { useDebounce } from "@/utils/UseDebounce";

interface GameCard {
    id: number;
    title: string;
    thumbnail: string;
    developer: string;
    platform: string;
    expertRating: number;
}

interface OptionItem {
    id: number;
    name: string;
}

export default function GamePage() {
    const itemsPerPage = 12;
    const [games, setGames] = useState<GameCard[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState<
        { id: number; type: "genre" | "theme" } | undefined
    >();
    const [selectedPlatformId, setSelectedPlatformId] = useState<
        number | undefined
    >();
    const [genres, setGenres] = useState<OptionItem[]>([]);
    const [themes, setThemes] = useState<OptionItem[]>([]);
    const [platforms, setPlatforms] = useState<OptionItem[]>([]);
    const [keyword, setKeyword] = useState("");

    const debounceKeyword = useDebounce(keyword, 250);

    const totalItems = games.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);
    const gamesForPage = games
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((game) => ({ ...game, rating: 0 }));

    // 필터 옵션 불러오기
    useEffect(() => {
        const fetchFilters = async () => {
            const res = await fetch("/api/games?meta=true");
            const data = await res.json();
            setGenres(data.genres);
            setThemes(data.themes);
            setPlatforms(data.platforms);
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchGames = async () => {
            const params = new URLSearchParams();
            if (selectedTag)
                params.append(selectedTag.type, selectedTag.id.toString());
            if (selectedPlatformId)
                params.append("platform", selectedPlatformId.toString());
            if (debounceKeyword) params.append("keyword", debounceKeyword);

            try {
                const res = await fetch(`/api/games?${params.toString()}`, {
                    signal: controller.signal,
                });

                const data = await res.json();

                if (Array.isArray(data)) {
                    setGames(data);
                    setCurrentPage(1);
                } else {
                    console.error("게임 데이터 응답이 배열이 아님:", data);
                    setGames([]);
                }
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    console.log("이전 요청 취소됨");
                } else {
                    console.error("게임 데이터 요청 실패:", error);
                }
            }
        };

        fetchGames();

        return () => {
            controller.abort();
        };
    }, [selectedTag, selectedPlatformId, debounceKeyword]);

    return (
        <div className="min-h-screen bg-background-400 text-font-100 py-12 space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-headline font-bold">게임 찾기</h1>
                    <p className="text-body text-font-200 font-regular mt-1">
                        다양한 장르와 플랫폼의 게임을 찾아보세요
                    </p>
                </div>
                <SearchBar keyword={keyword} setKeyword={setKeyword} />
            </div>

            <div className="flex items-start gap-8">
                <GameFilter
                    genres={genres}
                    themes={themes}
                    platforms={platforms}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    selectedPlatformId={selectedPlatformId}
                    setSelectedPlatformId={setSelectedPlatformId}
                />
                <div className="w-[1068px] space-y-10">
                    <GameCardList games={gamesForPage} />
                    <Pager
                        currentPage={currentPage}
                        pages={pages}
                        endPage={endPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}
