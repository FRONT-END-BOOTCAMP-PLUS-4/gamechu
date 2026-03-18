"use client";

import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TierBadge from "@/app/components/TierBadge";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";

export default function ArenaDetailHeader() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    const router = useRouter();

    const handleCreatorClick = async () => {
        const nickname = arenaDetail?.creatorName;
        if (!nickname) return;
        try {
            const myUserId = await getAuthUserId();
            if (!myUserId) {
                router.push(`/profile/${encodeURIComponent(nickname)}`);
                return;
            }
            const res = await fetch("/api/member/profile");
            if (!res.ok) throw new Error("Failed to fetch my profile");
            const myProfile = await res.json();
            if (myProfile.nickname === nickname) {
                router.push("/profile");
                return;
            }
            router.push(`/profile/${encodeURIComponent(nickname)}`);
        } catch {
            router.push(`/profile/${encodeURIComponent(nickname)}`);
        }
    };

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
                <div className="flex animate-fade-in items-center gap-3">
                    <button
                        type="button"
                        onClick={handleCreatorClick}
                        className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-background-200"
                    >
                        <Image
                            src={
                                arenaDetail?.creatorImageUrl ||
                                "/icons/teamA.svg"
                            }
                            alt="게시자 프로필"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                        />
                    </button>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-font-200">
                            게시자
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCreatorClick}
                                className="text-base font-bold text-font-100 hover:underline sm:text-lg"
                            >
                                {arenaDetail?.creatorName ?? "게시자"}
                            </button>
                            {typeof arenaDetail?.creatorScore === "number" && (
                                <TierBadge score={arenaDetail.creatorScore} />
                            )}
                        </div>
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
