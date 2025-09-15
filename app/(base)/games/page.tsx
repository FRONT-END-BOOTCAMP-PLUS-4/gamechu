"use client";

import React, { useEffect, useState } from "react";
import GameCardList from "./components/GameCardList";
import SearchBar from "./components/SearchBar";
import Pager from "@/app/components/Pager";
import { useDebounce } from "@/utils/UseDebounce";
import GameSort from "./components/GameSort";
import { useLoadingStore } from "@/stores/loadingStore";
import GamePageHeader from "./components/GamePageHeader";
import GameFilterWrapper from "./components/GameFilterWrapper";

interface GameCard {
    id: number;
    title: string;
    thumbnail: string;
    developer: string;
    platform: string;
    expertRating: number;
    reviewCount: number;
}

interface OptionItem {
    id: number;
    name: string;
}

export default function GamePage() {
    const { setLoading } = useLoadingStore();
    const [filterIsOpen, setFilterIsOpen] = useState(false);
    const itemsPerPage = 6;
    const [games, setGames] = useState<GameCard[]>([]);
    const [totalItems, setTotalItems] = useState(0);
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
    const [sortBy, setSortBy] = useState<"popular" | "rating" | "latest">(
        "popular"
    );
    const isFilterReady =
        Array.isArray(genres) &&
        genres.length > 0 &&
        Array.isArray(themes) &&
        themes.length > 0 &&
        Array.isArray(platforms) &&
        platforms.length > 0;

    const debounceKeyword = useDebounce(keyword, 250);
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTag, selectedPlatformId, debounceKeyword, sortBy]);

    useEffect(() => {
        const fetchFilters = async () => {
            setLoading(true);
            const res = await fetch("/api/games?meta=true");
            const data = await res.json();
            setGenres(data.genres);
            setThemes(data.themes);
            setPlatforms(data.platforms);
        };
        setTimeout(() => {
            fetchFilters();
        }, 0);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchGames = async () => {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedTag)
                params.append(selectedTag.type, selectedTag.id.toString());
            if (selectedPlatformId)
                params.append("platform", selectedPlatformId.toString());
            if (debounceKeyword) params.append("keyword", debounceKeyword);
            if (sortBy) params.append("sort", sortBy);
            params.append("page", currentPage.toString());
            params.append("size", itemsPerPage.toString());

            try {
                const res = await fetch(`/api/games?${params.toString()}`, {
                    signal: controller.signal,
                });
                const data = await res.json();

                if (Array.isArray(data.games)) {
                    setGames(data.games);
                    setTotalItems(data.totalCount);
                } else {
                    console.error("게임 데이터 응답 이상:", data);
                    setGames([]);
                    setTotalItems(0);
                }
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    console.log("요청 취소됨");
                } else {
                    console.error("게임 데이터 요청 실패:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
        return () => {
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTag, selectedPlatformId, debounceKeyword, sortBy, currentPage]);

    return (
        <div className="min-h-screen w-full space-y-10 bg-background-400 py-6 text-font-100 sm:py-12">
            <GamePageHeader />
            <div className="flex flex-wrap-reverse items-center gap-4 px-6 sm:gap-6">
                <div className="flex flex-1 gap-2 sm:gap-4">
                    {/* 모바일 전용 토글 버튼 */}
                    <button
                        className="h-10 flex-shrink-0 justify-center rounded-md bg-primary-blue-200 px-4 py-2 text-button text-sm font-medium text-font-100 text-white xl:hidden"
                        onClick={() => setFilterIsOpen(true)}
                    >
                        필터
                    </button>
                    <GameSort current={sortBy} onChange={setSortBy} />
                </div>
                <SearchBar keyword={keyword} setKeyword={setKeyword} />
            </div>

            <div className="flex w-full items-start gap-0 px-6 xl:gap-8">
                {isFilterReady && (
                    <GameFilterWrapper
                        isOpen={filterIsOpen}
                        onClose={() => setFilterIsOpen(false)}
                        genres={genres}
                        themes={themes}
                        platforms={platforms}
                        selectedTag={selectedTag}
                        setSelectedTag={setSelectedTag}
                        selectedPlatformId={selectedPlatformId}
                        setSelectedPlatformId={setSelectedPlatformId}
                    />
                )}
                <div className="w-full flex-1">
                    <GameCardList games={games} />
                    {games.length > 0 && (
                        <Pager
                            currentPage={currentPage}
                            pages={pages}
                            endPage={endPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
