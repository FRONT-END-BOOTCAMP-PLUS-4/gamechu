// components/ProfileSidebar.tsx
"use client";

import { useState } from "react";

const tabs = [
    { key: "reviews", label: "리뷰" },
    { key: "wishlists", label: "위시리스트" },
    { key: "score-history", label: "포인트 히스토리" },
    { key: "arena", label: "투기장" },
    { key: "profile", label: "계정" },
];

export default function ProfileSidebar({
    onSelect,
}: {
    onSelect: (tab: string) => void;
}) {
    const [active, setActive] = useState("reviews");

    return (
        <div className="w-[250px] bg-background-200 rounded-xl p-4 space-y-2">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => {
                        setActive(tab.key);
                        onSelect(tab.key);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors font-medium ${
                        active === tab.key
                            ? "bg-primary-purple-200 text-white"
                            : "text-font-100 hover:bg-background-300"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
