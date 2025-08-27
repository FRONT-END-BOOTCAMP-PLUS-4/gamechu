"use client";

import TierBadge from "@/app/components/TierBadge";
import Image from "next/image";
import { useRouter } from "next/navigation";

type WaitingArenaCardProps = {
    id: number;
    title: string;
    creatorNickname: string;
    creatorScore: number;
    challengerNickname: string | null;
    challengerScore: number | null;
    startDate: Date;
};

export default function WaitingArenaCard(props: WaitingArenaCardProps) {
    const router = useRouter();
    const onClickHandler = () => {
        router.push(`/arenas/${props.id}`);
    };

    return (
        <div
            className="flex h-full w-full transform flex-col gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
            onClick={onClickHandler}
        >
            <div className="flex flex-row items-start justify-between gap-1">
                <div className="line-clamp-2 min-h-[3.5rem] break-keep text-lg font-bold">
                    {props.title}
                </div>
                <div className="flex h-6 flex-shrink-0 items-center rounded-full bg-background-200 px-3 text-xs font-semibold">
                    대기중
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-100">
                {/* 작성자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.creatorNickname}
                    </span>
                    <TierBadge score={props.creatorScore} />
                </div>

                <span className="mx-2 text-gray-400">vs</span>

                {/* 도전자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.challengerNickname}
                    </span>
                    <TierBadge score={props.challengerScore || 0} />
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span className="text-gray-400">
                        토론 시작:{" "}
                        {props.startDate.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}
