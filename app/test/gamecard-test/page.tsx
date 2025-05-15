"use client";

import React from "react";
import GameCardList from "@/app/(base)/game/components/GameCardList";

const gameList = [
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
        platform: "Switch",
        title: "Zelda: Tears of the Kingdom",
        rating: 4.9,
        developer: "Nintendo",
        backgroundImage:
            "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/header.jpg",
    },

    // 필요하면 12개까지 쭉 추가
];

export default function GameCardListTestPage() {
    return (
        <div className="min-h-screen bg-background-400 text-font-100 p-10 space-y-10">
            <h1 className="text-headline font-bold">
                🎮 GameCard 리스트 테스트
            </h1>
            <GameCardList games={gameList} />
        </div>
    );
}
