"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
import GameCardList from "./components/GameCardList";
import SearchBar from "./components/SearchBar";
import Pager from "@/app/components/Pager";
import GameSort from "./components/GameSort";
import { useLoadingStore } from "@/stores/LoadingStore";
import GamePageHeader from "./components/GamePageHeader";
import GameFilterWrapper from "./components/GameFilterWrapper";
import { Filter } from "lucide-react";

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

interface GameMeta {
    genres: OptionItem[];
    themes: OptionItem[];
    platforms: OptionItem[];
}

interface GameListResponse {
    games: GameCard[];
    totalCount: number;
}

export default function GamePage() {
    const { setLoading } = useLoadingStore();
    const [filterIsOpen, setFilterIsOpen] = useState(false);
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState<
        { id: number; type: "genre" | "theme" } | undefined
    >();
    const [selectedPlatformId, setSelectedPlatformId] = useState<
        number | undefined
    >();
    const [sortBy, setSortBy] = useState<"popular" | "rating" | "latest">(
        "popular"
    );
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTag, selectedPlatformId, searchQuery, sortBy]);

    const { data: meta, isLoading: metaLoading } = useQuery<GameMeta>({
        queryKey: queryKeys.gameMeta(),
        queryFn: () => fetcher("/api/games?meta=true"),
    });

    const genres = meta?.genres ?? [];
    const themes = meta?.themes ?? [];
    const platforms = meta?.platforms ?? [];
    const isFilterReady =
        genres.length > 0 && themes.length > 0 && platforms.length > 0;

    const gamesParams = {
        page: currentPage,
        size: itemsPerPage,
        ...(selectedTag?.type === "genre" ? { genreId: selectedTag.id } : {}),
        ...(selectedTag?.type === "theme" ? { themeId: selectedTag.id } : {}),
        ...(selectedPlatformId ? { platformId: selectedPlatformId } : {}),
        ...(searchQuery ? { keyword: searchQuery } : {}),
        ...(sortBy ? { sort: sortBy } : {}),
    };

    const { data: gameData, isLoading: gamesLoading } =
        useQuery<GameListResponse>({
            queryKey: queryKeys.games(gamesParams),
            queryFn: () => {
                const params = new URLSearchParams();
                if (selectedTag) {
                    params.append(
                        selectedTag.type === "genre" ? "genreId" : "themeId",
                        selectedTag.id.toString()
                    );
                }
                if (selectedPlatformId)
                    params.append("platformId", selectedPlatformId.toString());
                if (searchQuery) params.append("keyword", searchQuery);
                if (sortBy) params.append("sort", sortBy);
                params.append("page", currentPage.toString());
                params.append("size", itemsPerPage.toString());
                return fetcher(`/api/games?${params.toString()}`);
            },
        });

    const games = Array.isArray(gameData?.games) ? gameData.games : [];
    const totalItems = gameData?.totalCount ?? 0;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);

    const isLoading = metaLoading || gamesLoading;

    useEffect(() => {
        setLoading(isLoading);
        return () => {
            setLoading(false);
        };
    }, [isLoading, setLoading]);

    // 필터 사이드바가 열린 상태에서 메인 화면 스크롤 방지
    useEffect(() => {
        if (filterIsOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [filterIsOpen]);

    return (
        <div className="custom-scroll min-h-screen w-full space-y-10 bg-background-400 py-6 text-font-100 sm:py-12">
            <GamePageHeader />
            <div className="flex flex-wrap-reverse items-center justify-between gap-4 px-6 sm:gap-6">
                <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
                    {/* 필터 버튼 */}
                    <button
                        className="group flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-white/5 bg-background-300/50 p-1 px-5 transition-all hover:bg-white/5 active:scale-95 xl:hidden"
                        onClick={() => setFilterIsOpen(true)}
                    >
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary-blue-200/20 text-primary-blue-100 transition-colors group-hover:bg-primary-blue-200/30">
                            <Filter
                                size={16}
                                className="transition-transform duration-300"
                            />
                        </div>
                        <span className="text-[13px] font-bold tracking-wide text-font-200 group-hover:text-font-100">
                            게임 필터
                        </span>
                    </button>

                    {/* GameSort 컴포넌트 */}
                    <GameSort current={sortBy} onChange={setSortBy} />
                </div>

                {/* 검색창 */}
                <SearchBar onSearch={setSearchQuery} />
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
