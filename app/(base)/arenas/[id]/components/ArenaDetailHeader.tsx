"use client";

import useArenaStore from "@/stores/useArenaStore";
import UserProfileComponent from "@/app/components/UserProfileComponent";

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
                <div className="flex animate-fade-in flex-col gap-1">
                    <span className="text-xs font-bold text-font-200">
                        게시자
                    </span>
                    <UserProfileComponent
                        profileImage={arenaDetail?.creatorImageUrl || "/icons/teamA.svg"}
                        nickname={arenaDetail?.creatorName ?? ""}
                        score={arenaDetail?.creatorScore}
                    />
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
