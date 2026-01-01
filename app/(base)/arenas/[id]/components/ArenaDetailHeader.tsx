"use client";

import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";

export default function ArenaDetailHeader() {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    return (
        <div className="flex w-full max-w-[1000px] flex-col gap-6">
            {/* 상단: 제목 & 게시자 */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                {/* 제목 */}
                <div className="flex animate-fade-in-left items-center gap-2">
                    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-background-300/50 sm:h-14 sm:w-14">
                        <Image
                            src="/icons/arena.svg"
                            alt="투기장 아이콘"
                            width={32}
                            height={32}
                            className={"flex-shrink-0 sm:h-10 sm:w-10"}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-primary-100 text-xs font-bold tracking-widest opacity-80 sm:text-sm">
                            Arena Topic
                        </span>
                        <h2 className="break-words text-xl font-black tracking-tight text-font-100 sm:text-3xl">
                            {arenaDetail?.title ?? "투기장 제목"}
                        </h2>
                    </div>
                </div>

                {/* 게시자 */}
                <div className="flex min-w-0 flex-shrink-0 animate-fade-in-right items-center gap-3 rounded-2xl border border-background-200 bg-background-300/50 p-2 pr-4 transition-all sm:p-2 sm:pr-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11">
                        <Image
                            src="/icons/teamA.svg"
                            alt="게시자 아이콘"
                            width={28}
                            height={28}
                            className={"sm:h-9 sm:w-9"}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase text-font-200 sm:text-xs">
                            게시자
                        </span>
                        <h2 className="max-w-[130px] truncate text-sm font-extrabold text-font-100 sm:max-w-[160px] sm:text-base">
                            {arenaDetail?.creatorName ?? "게시자"}
                        </h2>
                    </div>
                </div>
            </div>

            {/* 하단: 내용 */}
            <div className="relative max-h-64 animate-fade-in-up overflow-hidden rounded-3xl bg-background-300">
                <div className="h-full w-full overflow-y-auto whitespace-pre-line rounded-[23px] bg-background-300 p-6 text-[15px] leading-relaxed text-font-100 sm:text-lg">
                    {arenaDetail?.description ?? "투기장 내용"}
                </div>
            </div>
        </div>
    );
}
