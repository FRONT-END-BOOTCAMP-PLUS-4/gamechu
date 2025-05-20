"use client";

import React, { useEffect, useState } from "react";
import GameCardList from "./components/GameCardList";
import GameFilter from "./components/GameFilter";
import SearchBar from "./components/SearchBar";
import Pager from "@/app/components/Pager";

interface GameCard {
    id: number;
    title: string;
    thumbnail: string;
    developer: string;
    platform: string;
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

    const totalItems = games.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);
    const gamesForPage = games
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((game) => ({ ...game, rating: 0 }));

    useEffect(() => {
        const fetchFilters = async () => {
            const res = await fetch("/api/games/filters");
            const data = await res.json();
            setGenres(data.genres);
            setThemes(data.themes);
            setPlatforms(data.platforms);
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchGames = async () => {
            const params = new URLSearchParams();
            if (selectedTag)
                params.append(selectedTag.type, selectedTag.id.toString());
            if (selectedPlatformId)
                params.append("platform", selectedPlatformId.toString());
            if (keyword) params.append("keyword", keyword);

            const res = await fetch(`/api/games?${params.toString()}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setGames(data);
                setCurrentPage(1);
            } else {
                console.error("게임 데이터 응답이 배열이 아님:", data);
                setGames([]);
            }
        };

        fetchGames();
    }, [selectedTag, selectedPlatformId, keyword]);

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

            <div className="flex gap-10 items-start">
                <GameFilter
                    genres={genres}
                    themes={themes}
                    platforms={platforms}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    selectedPlatformId={selectedPlatformId}
                    setSelectedPlatformId={setSelectedPlatformId}
                />
                <div className="ml-auto w-[1020px] space-y-10">
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
