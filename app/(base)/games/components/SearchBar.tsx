"use client";

import React, { useState } from "react";
import { cn } from "@/utils/TailwindUtil";
import { Search, X } from "lucide-react";

type SearchBarProps = {
    onSearch: (value: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [localKeyword, setLocalKeyword] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = () => {
        onSearch(localKeyword.trim());
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleClear = () => {
        setLocalKeyword("");
        onSearch("");
    };

    return (
        <div className="flex w-full items-center sm:max-w-[320px]">
            <div
                className={cn(
                    "relative flex h-11 w-full items-center overflow-hidden rounded-xl border transition-all duration-300",
                    isFocused
                        ? "border-primary-purple-200 bg-background-200"
                        : "border-white/5 bg-background-300/90"
                )}
            >
                <button
                    onClick={handleSearch}
                    className="text-font-400 ml-3 flex items-center justify-center transition-colors hover:text-primary-purple-100"
                >
                    <Search size={18} />
                </button>

                <input
                    type="text"
                    value={localKeyword}
                    onChange={(e) => setLocalKeyword(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="제목 또는 개발사 검색 (영문)"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="placeholder-font-400 h-full w-full bg-transparent px-3 text-[14px] font-medium text-font-100 outline-none"
                />

                {localKeyword && (
                    <button
                        onClick={handleClear}
                        className="text-font-400 mr-2 flex h-6 w-6 items-center justify-center rounded-full transition-all hover:bg-white/10 hover:text-font-100"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
