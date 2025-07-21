"use client";

import TierBadge from "@/app/components/TierBadge";
import Image from "next/image";
import { useRouter } from "next/navigation";

type VotingArenaCardProps = {
    id: number;
    title: string;
    creatorNickname: string;
    creatorScore: number;
    challengerNickname: string | null;
    challengerScore: number | null;
    voteEndDate: Date;
    voteCount: number;
};

export default function VotingArenaCard(props: VotingArenaCardProps) {
    const router = useRouter();
    const onClickHandler = () => {
        router.push(`/arenas/${props.id}`);
    };

    return (
        <div
            className="w-[440px] transform gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
            onClick={onClickHandler}
        >
            <div className="flex items-center justify-between">
                <div className="line-clamp-2 text-lg font-bold">
                    {props.title}
                </div>
                <div className="rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold text-white">
                    투표중
                </div>
            </div>

            <div className="m-2 mt-2 flex items-center justify-between gap-4 text-sm text-gray-100">
                <div className="flex items-center gap-2">
                    <span>{props.creatorNickname}</span>
                    <TierBadge score={props.creatorScore} size="sm" />
                </div>

                <span className="mx-2 text-gray-400">vs</span>

                {/* 도전자 */}
                <div className="flex items-center gap-2">
                    <span>{props.challengerNickname}</span>
                    <TierBadge score={props.challengerScore || 0} size="sm" />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center gap-1">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span className="text-gray-400">
                        투표 종료:{" "}
                        {props.voteEndDate.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Image
                        src="/icons/voteComplete.svg"
                        alt="투표완료 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span className="text-gray-400">
                        {props.voteCount}명 투표
                    </span>
                </div>
            </div>
        </div>
    );
}
