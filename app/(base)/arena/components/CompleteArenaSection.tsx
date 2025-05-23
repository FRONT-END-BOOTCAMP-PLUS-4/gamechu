import ArenaSectionHeader from "./ArenaSectionHeader";
import CompleteArenaCard from "./CompleteArenaCard";

export default function CompleteArenaSection() {
    return (
        <div>
            <ArenaSectionHeader
                title="투표가 진행중인 투기장"
                href="/arena?status=4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 px-6">
                <CompleteArenaCard
                    title="싱글플레이어vs멀티플레이어 게임의 미래"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorTierImageUrl="/icons/platinum.svg"
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerTierImageUrl="/icons/bronze.svg"
                    startDate={new Date()}
                    voteCount={23}
                />
                <CompleteArenaCard
                    title="콘솔 vs PC 게이밍 진영 논쟁"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorTierImageUrl="/icons/platinum.svg"
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerTierImageUrl="/icons/bronze.svg"
                    startDate={new Date()}
                    voteCount={45}
                />
                <CompleteArenaCard
                    title="과금 게임이 공정할 수 있는가?"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorTierImageUrl="/icons/platinum.svg"
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerTierImageUrl="/icons/bronze.svg"
                    startDate={new Date()}
                    voteCount={67}
                />
            </div>
        </div>
    );
}
