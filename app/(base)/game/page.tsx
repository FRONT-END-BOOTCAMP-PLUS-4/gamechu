"use client";

import React, { useState } from "react";
import GameCardList from "./components/GameCardList";
import GameFilter from "./components/GameFilter";
import SearchBar from "./components/SearchBar";
import Pager from "@/app/components/Pager";

// 샘플 데이터
const dummyGames = [
    {
        platform: "PC",
        title: "Hollow Knight",
        rating: 4.8,
        developer: "Team Cherry",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "PS5",
        title: "Final Fantasy XVI",
        rating: 4.5,
        developer: "Square Enix",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "PC",
        title: "Hollow Knight",
        rating: 4.8,
        developer: "Team Cherry",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "PS5",
        title: "Final Fantasy XVI",
        rating: 4.5,
        developer: "Square Enix",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "PC",
        title: "Hollow Knight",
        rating: 4.8,
        developer: "Team Cherry",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "PS5",
        title: "Final Fantasy XVI",
        rating: 4.5,
        developer: "Square Enix",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "PC",
        title: "Hollow Knight",
        rating: 4.8,
        developer: "Team Cherry",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "PS5",
        title: "Final Fantasy XVI",
        rating: 4.5,
        developer: "Square Enix",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "PC",
        title: "Hollow Knight",
        rating: 4.8,
        developer: "Team Cherry",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "PS5",
        title: "Final Fantasy XVI",
        rating: 4.5,
        developer: "Square Enix",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "PC",
        title: "Hollow Knight",
        rating: 4.8,
        developer: "Team Cherry",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "PS5",
        title: "Final Fantasy XVI",
        rating: 4.5,
        developer: "Square Enix",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
    {
        platform: "PC",
        title: "Hollow Knight",
        rating: 4.8,
        developer: "Team Cherry",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "PS5",
        title: "Final Fantasy XVI",
        rating: 4.5,
        developer: "Square Enix",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },
];

export default function GamePage() {
    const itemsPerPage = 12;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = dummyGames.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);

    const gamesForPage = dummyGames.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-background-400 text-font-100 py-12 space-y-10">
            {/* 상단 타이틀 + 서치바 */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-headline font-bold">게임 찾기</h1>
                    <p className="text-body text-font-200 font-regular mt-1">
                        다양한 장르와 플랫폼의 게임을 찾아보세요
                    </p>
                </div>
                <SearchBar />
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex gap-10 items-start">
                {/* 좌측 필터 */}
                <GameFilter />

                {/* 우측 게임 카드 리스트 */}
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
