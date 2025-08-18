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
        <div
            className={[
                "w-[250px] space-y-2 rounded-xl bg-background-200 p-4",
                "max-[820px]:mx-auto max-[820px]:w-full max-[820px]:max-w-[520px]",
                "max-[820px]:grid max-[820px]:grid-cols-2 max-[820px]:gap-3",
                "max-[820px]:space-y-0 max-[820px]:p-3",
            ].join(" ")}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => {
                        setActive(tab.key);
                        onSelect(tab.key);
                    }}
                    className={[
                        // 데스크탑: 좌측 정렬
                        "w-full rounded-lg px-4 py-2 text-left font-medium transition-colors",
                        // ✅ 모바일: 정중앙 정렬 (가로·세로)
                        "max-[820px]:flex max-[820px]:items-center max-[820px]:justify-center",
                        "max-[820px]:h-12 max-[820px]:px-2 max-[820px]:py-0 max-[820px]:text-center",
                        active === tab.key
                            ? "bg-primary-purple-200 text-white"
                            : "text-font-100 hover:bg-background-300",
                    ].join(" ")}
                >
                    <span className="whitespace-normal break-keep leading-tight">
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
