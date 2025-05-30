"use client";

import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";

export default function ArenaDetailHeader() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    return (
        <div className="w-full max-w-[1000px] flex flex-col gap-4">
            {/* 상단: 제목 & 게시자 */}
            <div className="flex justify-between items-center">
                {/* 제목 */}
                <div className="flex items-center animate-fade-in-left">
                    <Image
                        src="/icons/arena2.svg"
                        alt="투기장 아이콘"
                        width={40}
                        height={40}
                    />
                    <h2 className="text-h2 font-bold text-font-100">
                        {arenaDetail?.title ?? "투기장 제목"}
                    </h2>
                </div>
                {/* 게시자 */}
                <div className="flex items-center gap-2 animate-fade-in-right">
                    <Image
                        src="/icons/teamA.svg"
                        alt="게시자 아이콘"
                        width={40}
                        height={40}
                    />
                    <h2 className="text-h2 font-bold text-font-100">
                        {arenaDetail?.creatorName ?? "게시자"}
                    </h2>
                </div>
            </div>

            {/* 하단: 내용 */}
            <div className="h-32 bg-background-300 rounded-xl p-4 text-font-100 text-body animate-fade-in-up">
                {arenaDetail?.description ?? "투기장 내용"}
            </div>
        </div>
    );
}
