"use client";

import TierBadge from "@/app/components/TierBadge";
import Image from "next/image";
import { useRouter } from "next/navigation";

type RecruitingArenaCardProps = {
    id: number;
    creatorNickname: string;
    creatorProfileImageUrl: string;
    creatorScore: number;
    title: string;
    description: string;
    startDate: Date;
};

export default function RecruitingArenaCard(props: RecruitingArenaCardProps) {
    const router = useRouter();
    const onClickHandler = () => {
        router.push(`/arenas/${props.id}`);
    };

    return (
        <div
            className="flex h-full w-full transform flex-col gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
            onClick={onClickHandler}
        >
            <div className="flex flex-row items-center justify-between gap-1">
                {/* 작성자 정보 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <Image
                        src={props.creatorProfileImageUrl}
                        alt="작성자 프로필"
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.creatorNickname}
                    </span>
                    <TierBadge score={props.creatorScore} />
                </div>
                <div className="flex h-6 flex-shrink-0 items-center rounded-full bg-background-200 px-3 text-xs font-semibold">
                    모집중
                </div>
            </div>

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

            {/* 하단 영역 */}
            <div className="mt-2 flex items-center justify-between">
                {/* 시작 시간 */}
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span>
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
