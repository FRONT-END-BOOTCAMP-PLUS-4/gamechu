import Image from "next/image";

type RecruitingArenaCardProps = {
    creatorNickname: string;
    creatorProfileImageUrl: string;
    creatorTierImageUrl: string;
    title: string;
    description: string;
    startDate: Date;
};

export default function RecruitingArenaCard(props: RecruitingArenaCardProps) {
    return (
        <div className="bg-background-300 rounded-2xl gap-4 p-4 shadow-md text-white w-[440px]">
            <div className="flex items-center justify-between">
                <div className="text-lg font-bold line-clamp-2">
                    {props.title}
                </div>
                <div className="bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    모집중
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-gray-100 mt-4 m-4">
                <div className="flex items-center gap-2">
                    <Image
                        src={props.creatorProfileImageUrl}
                        alt="작성자 프로필"
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                    <span>{props.creatorNickname}</span>
                    <Image
                        src={props.creatorTierImageUrl}
                        alt="작성자 티어"
                        width={16}
                        height={16}
                    />
                </div>

                <span className="mx-2 text-gray-400">vs</span>
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
