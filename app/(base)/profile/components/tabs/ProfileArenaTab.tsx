"use client";

import { useState } from "react";
import MyWaitingArenaList from "../MyWaitingArenaList";
import MyDebatingArenaList from "../MyDebatingArenaList";
import MyCompletedArenaList from "../MyCompletedArenaList";

const TABS = [
    { key: "waiting", label: "대기 중" },
    { key: "debating", label: "토론 중" },
    { key: "completed", label: "종료됨" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function ProfileArenaTab() {
    const [activeTab, setActiveTab] = useState<TabKey>("waiting");

    const renderContent = () => {
        switch (activeTab) {
            case "waiting":
                return <MyWaitingArenaList />;
            case "debating":
                return <MyDebatingArenaList />;
            case "completed":
                return <MyCompletedArenaList />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full bg-background-300 p-6 rounded-xl shadow flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-body">투기장</h2>

            {/* 탭 메뉴 */}
            <div className="flex gap-4 border-b border-gray-600 pb-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                            activeTab === tab.key
                                ? "border-purple-500 text-purple-500"
                                : "border-transparent text-gray-400 hover:text-white"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 탭 내용 */}
            <div>{renderContent()}</div>
        </div>
    );
}
