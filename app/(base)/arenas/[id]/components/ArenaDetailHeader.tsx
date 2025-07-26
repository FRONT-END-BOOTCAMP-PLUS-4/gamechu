"use client";

import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";

export default function ArenaDetailHeader() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    return (
        <div className="flex w-full max-w-[1000px] flex-col gap-4">
            {/* 상단: 제목 & 게시자 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                {/* 제목 */}
                <div className="flex min-w-0 animate-fade-in-left items-center">
                    <Image
                        src="/icons/arena2.svg"
                        alt="투기장 아이콘"
                        width={40}
                        height={40}
                    />
                    <h2 className="ml-2 max-w-[400px] truncate text-h2 font-bold text-font-100">
                        {arenaDetail?.title ?? "투기장 제목"}
                    </h2>
                </div>
                {/* 게시자 */}
                <div className="flex min-w-0 animate-fade-in-right items-center gap-2">
                    <Image
                        src="/icons/teamA.svg"
                        alt="게시자 아이콘"
                        width={40}
                        height={40}
                    />
                    <h2 className="max-w-[150px] truncate text-h2 font-bold text-font-100">
                        {arenaDetail?.creatorName ?? "게시자"}
                    </h2>
                </div>
            </div>

            {/* 하단: 내용 */}
            <div className="max-h-64 animate-fade-in-up overflow-y-auto rounded-xl bg-background-300 p-4 text-body text-font-100">
                {arenaDetail?.description ?? "투기장 내용"}
            </div>
        </div>
    );
}
