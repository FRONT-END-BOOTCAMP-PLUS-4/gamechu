"use client";

import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";

export default function ArenaDetailHeader() {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    return (
        <div className="flex w-full max-w-[1000px] flex-col gap-4">
            {/* 상단: 제목 & 게시자 */}
            <div className="flex flex-wrap items-start justify-between gap-2">
                {/* 제목 */}
                <div className="flex animate-fade-in-left items-center gap-2">
                    <Image
                        src="/icons/arena.svg"
                        alt="투기장 아이콘"
                        width={28}
                        height={28}
                        className={"flex-shrink-0 sm:h-10 sm:w-10"}
                    />
                    <h2 className="break-words text-lg font-bold text-font-100 sm:text-2xl">
                        {arenaDetail?.title ?? "투기장 제목"}
                    </h2>
                </div>

                {/* 게시자 */}
                <div className="flex min-w-0 flex-shrink-0 animate-fade-in-right items-center gap-2">
                    <Image
                        src="/icons/teamA.svg"
                        alt="게시자 아이콘"
                        width={28}
                        height={28}
                        className={"sm:h-10 sm:w-10"}
                    />
                    <h2 className="max-w-[150px] truncate text-lg font-bold text-font-100 sm:text-2xl">
                        {arenaDetail?.creatorName ?? "게시자"}
                    </h2>
                </div>
            </div>

            {/* 하단: 내용 */}
            <div className="max-h-64 animate-fade-in-up overflow-y-auto whitespace-pre-line rounded-xl bg-background-300 p-4 text-sm text-font-100 sm:text-lg">
                {arenaDetail?.description ?? "투기장 내용"}
            </div>
        </div>
    );
}
