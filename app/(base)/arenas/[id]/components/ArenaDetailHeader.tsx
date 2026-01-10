"use client";

import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";

export default function ArenaDetailHeader() {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    return (
        <div className="flex w-full max-w-[1000px] flex-col gap-4 rounded-3xl border border-background-200 bg-background-300 px-4 py-6 sm:px-8 sm:py-10">
            <div className="relative flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    {/* 메인 제목 */}
                    <h2 className="animate-fade-in-left break-words text-xl font-extrabold tracking-tight text-font-100 sm:text-3xl">
                        {arenaDetail?.title ?? "투기장 제목"}
                    </h2>
                </div>

                {/* 게시자 */}
                <div className="flex animate-fade-in items-center gap-4">
                    <div className="flex shrink-0 items-center justify-center">
                        <Image
                            src="/icons/teamA.svg"
                            alt="게시자"
                            width={40}
                            height={40}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-font-200">
                            게시자
                        </span>
                        <span className="text-sm font-bold text-font-100 sm:text-base">
                            {arenaDetail?.creatorName ?? "게시자"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="h-[2px] bg-background-200" />
            {/* 내용 영역 */}
            <div className="relative animate-fade-in-up">
                <div className="whitespace-pre-line text-sm text-font-100 sm:text-base">
                    {arenaDetail?.description ??
                        "투기장 내용을 불러오는 중입니다."}
                </div>
            </div>
        </div>
    );
}
