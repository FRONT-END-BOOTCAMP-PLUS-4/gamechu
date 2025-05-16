"use client";

import React, { useState } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";

export default function SearchBar() {
    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        console.log("🔍 검색:", keyword);
        // 여기에 검색 API 연결 or 필터링 로직 나중에 추가
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative w-[250px] h-[32px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Image
                        src="/icons/search.svg"
                        alt="검색"
                        width={16}
                        height={16}
                    />
                </div>

                {/* 인풋 */}
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="게임 검색하기"
                    className="w-full h-full pl-9 pr-3  text-font-100 placeholder-font-200 bg-background-100 border border-line-200 rounded-[4px] outline-none"
                />
            </div>

            <Button
                size="xs"
                type="purple"
                onClick={handleSearch}
                icon={
                    <Image
                        src="/icons/send.svg"
                        alt="검색"
                        width={16}
                        height={16}
                        className="inline-block align-middle object-contain"
                    />
                }
            />
        </div>
    );
}
