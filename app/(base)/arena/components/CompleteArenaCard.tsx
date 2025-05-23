import Image from "next/image";

type CompleteArenaCardProps = {
    creatorNickname: string;
    creatorProfileImageUrl: string;
    creatorTierImageUrl: string;
    challengerNickname: string;
    challengerProfileImageUrl: string;
    challengerTierImageUrl: string;
    title: string;
    description: string;
    voteCount: number;
};

export default function CompleteArenaCard(props: CompleteArenaCardProps) {
    return (
        <div
            className="bg-background-300 rounded-2xl gap-4 p-4 shadow-md text-white w-[670px]
                border border-transparent hover:border-purple-500
                hover:shadow-lg hover:shadow-purple-500/30
                hover:scale-[1.01] transform transition-all duration-200"
        >
            <div className="rounded-2xl bg-background-200 p-4">
                {/* 제목 */}
                <div className="text-base font-semibold text-white">
                    {props.title}
                </div>

                {/* 설명 */}
                <div className="text-sm text-gray-300">{props.description}</div>
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
        </div>
    );
}
