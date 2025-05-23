import Image from "next/image";

type VotingArenaCardProps = {
    title: string;
    creatorNickname: string;
    creatorProfileImageUrl: string;
    creatorTierImageUrl: string;
    challengerNickname: string;
    challengerProfileImageUrl: string;
    challengerTierImageUrl: string;
    voteEndDate: Date;
    voteCount: number;
};

export default function VotingArenaCard(props: VotingArenaCardProps) {
    return (
        <div
            className="bg-background-300 rounded-2xl gap-4 p-4 shadow-md text-white w-[440px]
                border border-transparent hover:border-purple-500
                hover:shadow-lg hover:shadow-purple-500/30
                hover:scale-[1.01] transform transition-all duration-200"
        >
            <div className="flex items-center justify-between">
                <div className="text-lg font-bold line-clamp-2">
                    {props.title}
                </div>
                <div className="bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    투표중
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

                {/* 도전자 */}
                <div className="flex items-center gap-2">
                    <Image
                        src={props.challengerProfileImageUrl}
                        alt="도전자 프로필"
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                    <span>{props.challengerNickname}</span>
                    <Image
                        src={props.challengerTierImageUrl}
                        alt="도전자 티어"
                        width={16}
                        height={16}
                    />
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
                        투표 종료: {props.voteEndDate.toISOString()}
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
