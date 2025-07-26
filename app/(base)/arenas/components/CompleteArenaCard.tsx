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
};

export default function CompleteArenaCard(props: CompleteArenaCardProps) {
    const router = useRouter();
    const onClickHandler = () => {
        router.push(`/arenas/${props.id}`);
    };
    return (
        <div
            className="w-[670px] transform gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
            onClick={onClickHandler}
        >
            <div className="rounded-2xl bg-background-200 p-4">
                {/* 제목 */}
                <div className="text-base font-semibold text-white">
                    {props.title}
                </div>

                {/* 설명 */}
                <div className="text-sm text-gray-300">{props.description}</div>
            </div>

            <VoteStatusBar
                voteCount={props.voteCount}
                leftPercent={props.leftPercent}
                rightPercent={props.rightPercent}
            />
            <div className="m-4 mt-4 flex items-center justify-between gap-4 text-sm text-gray-100">
                <div className="flex items-center gap-2">
                    <Image
                        src={props.creatorProfileImageUrl}
                        alt="작성자 프로필"
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                    <span>{props.creatorNickname}</span>
                    <TierBadge score={props.creatorScore} size="sm" />
                    <span>{props.leftPercent}%</span>
                </div>

                <span className="mx-2 text-gray-400">vs</span>

                {/* 도전자 */}
                <div className="flex items-center gap-2">
                    <span>{props.rightPercent}%</span>
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
                    <span>{props.challengerNickname}</span>
                    <TierBadge score={props.challengerScore || 0} size="sm" />
                </div>
            </div>
        </div>
    );
}
