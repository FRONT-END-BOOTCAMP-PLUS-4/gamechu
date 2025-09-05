"use client";

import TierBadge from "@/app/components/TierBadge";
import Image from "next/image";
import VoteStatusBar from "./VoteStatusBar";
import { useRouter } from "next/navigation";

type CompleteArenaCardProps = {
    id: number;
    title: string;
    description: string;

    creatorNickname: string;
    creatorProfileImageUrl: string;
    creatorScore: number;
    challengerNickname: string | null;
    challengerProfileImageUrl: string | null;
    challengerScore: number | null;

    voteCount: number;
    leftCount: number;
    rightCount: number;
    leftPercent: number;
    rightPercent: number;
    showBadgeIconOnly?: boolean;
};

export default function CompleteArenaCard({
    showBadgeIconOnly = false,
    ...props
}: CompleteArenaCardProps) {
    const router = useRouter();
    const onClickHandler = () => {
        router.push(`/arenas/${props.id}`);
    };
    return (
        <div
            className="flex h-full w-full transform flex-col gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
            onClick={onClickHandler}
        >
            <div className="flex-grow rounded-2xl bg-background-200 p-4">
                {/* 제목 */}
                <div className="break-keep text-base font-semibold text-white">
                    {props.title}
                </div>

                {/* 설명 */}
                <div className="line-clamp-3 overflow-hidden break-keep text-sm text-gray-300">
                    {props.description}
                </div>
            </div>

            <VoteStatusBar
                voteCount={props.voteCount}
                leftPercent={props.leftPercent}
                rightPercent={props.rightPercent}
            />
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between">
                {/* 작성자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <Image
                        src={props.creatorProfileImageUrl}
                        alt="작성자 프로필"
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                    <span className="max-w-[80px] truncate whitespace-nowrap">
                        {props.creatorNickname}
                    </span>
                    <TierBadge
                        score={props.creatorScore}
                        iconOnly={showBadgeIconOnly}
                    />
                    <span className="whitespace-nowrap">
                        {props.leftPercent}%
                    </span>
                </div>

                <span className="mx-2 flex-shrink-0 items-center text-gray-400">
                    vs
                </span>

                {/* 도전자 */}
                <div className="flex min-w-0 flex-shrink items-center justify-end gap-2 overflow-hidden">
                    <span className="whitespace-nowrap">
                        {props.rightPercent}%
                    </span>
                    <Image
                        src={
                            props.challengerProfileImageUrl ||
                            "/icons/arena2.svg"
                        }
                        alt="도전자 프로필"
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                    <span className="max-w-[80px] truncate whitespace-nowrap">
                        {props.challengerNickname}
                    </span>
                    <TierBadge
                        score={props.challengerScore || 0}
                        iconOnly={showBadgeIconOnly}
                    />
                </div>
            </div>
        </div>
    );
}
