"use client";

import { useState } from "react";

const ownProfileTabs = [
    { key: "reviews", label: "리뷰" },
    { key: "wishlists", label: "위시리스트" },
    { key: "score-history", label: "포인트 히스토리" },
    { key: "arena", label: "투기장" },
    { key: "profile", label: "계정" },
];

const otherProfileTabs = [
    { key: "reviews", label: "리뷰" },
    { key: "arena", label: "투기장" },
];

type ProfileSidebarProps = {
    isOwnProfile: boolean;
    onSelect: (tab: string) => void;
};

export default function ProfileSidebar({
    isOwnProfile,
    onSelect,
}: ProfileSidebarProps) {
    const [active, setActive] = useState("reviews");
    const tabs = isOwnProfile ? ownProfileTabs : otherProfileTabs;

    return (
        <div
            className={[
                "rounded-xl bg-background-200",
                "mx-auto w-full max-w-full p-3",
                isOwnProfile ? "grid auto-rows-fr grid-cols-3 gap-3" : "grid auto-rows-fr grid-cols-2 gap-3",
                "md:mx-0 md:block md:w-[250px] md:space-y-2 md:p-4",
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
                        "flex h-12 w-full items-center justify-center rounded-lg p-0 font-medium transition-colors",
                        "md:block md:h-auto md:px-4 md:py-2 md:text-left",
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
