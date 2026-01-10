"use client";
import Image from "next/image";

export default function GamePageHeader() {
    return (
        <div className="flex flex-col items-start justify-between gap-4 px-6 md:flex-row md:items-center">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Image
                        src="/icons/gamesearch.svg"
                        alt="게임 탐색 아이콘"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                    <h1 className="text-3xl font-semibold text-font-100">
                        게임 탐색
                    </h1>
                </div>
                <p className="sm:text-md break-keep text-sm text-gray-400">
                    수많은 게임들 중 나에게 맞는 게임을 탐색하는 장입니다. 장르,
                    테마, 플랫폼 등의 필터와 리뷰순, 최신순, 별점순 정렬 기능을
                    사용해보세요. 또는 직접 제목 또는 개발사로 검색하실 수도
                    있습니다.
                </p>
            </div>
        </div>
    );
}
