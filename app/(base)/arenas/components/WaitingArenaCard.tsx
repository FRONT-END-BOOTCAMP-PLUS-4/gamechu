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
            className="bg-background-300 rounded-2xl gap-4 p-4 shadow-md text-white w-[440px]
                border border-transparent hover:border-purple-500
                hover:shadow-lg hover:shadow-purple-500/30
                hover:scale-[1.01] transform transition-all duration-200"
            onClick={onClickHandler}
        >
            <div className="flex items-center justify-between">
                <div className="text-lg font-bold line-clamp-2">
                    {props.title}
                </div>
                <div className="bg-background-200 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    대기중
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-gray-100 mt-4 m-4">
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

            <div className="flex items-center justify-between text-sm text-gray-300 mt-4">
                <div className="flex items-center gap-1">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span className="text-gray-400">
                        토론 시작: {props.startDate.toISOString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
