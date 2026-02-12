"use client";

import { cn } from "@/utils/tailwindUtil";

interface SortOption {
    label: string;
    value: "latest" | "popular" | "rating";
}

interface Props {
    current: "latest" | "popular" | "rating";
    onChange: (value: "latest" | "popular" | "rating") => void;
}

const options: SortOption[] = [
    { label: "리뷰순", value: "popular" },
    { label: "최신순", value: "latest" },
    { label: "별점순", value: "rating" },
];

export default function GameSort({ current, onChange }: Props) {
    return (
        <div className="flex flex-1 items-center gap-1 rounded-xl border border-white/5 bg-background-300/50 p-1 shadow-inner sm:flex-none">
            {options.map((option) => {
                const isSelected = current === option.value;

                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "relative flex h-9 flex-1 items-center justify-center rounded-lg px-2 text-xs font-bold transition-all duration-300 sm:px-8 sm:text-sm",
                            isSelected
                                ? "bg-primary-purple-300 text-white shadow-md shadow-primary-purple-300/20"
                                : "text-font-300 hover:bg-white/5 hover:text-font-100"
                        )}
                    >
                        <span className="truncate whitespace-nowrap">
                            {option.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
