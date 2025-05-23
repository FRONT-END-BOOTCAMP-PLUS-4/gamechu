import ArenaSectionHeader from "./ArenaSectionHeader";
import DebatingArenaCard from "./DebatingArenaCard";

export default function DebatingArenaSection() {
    return (
        <div>
            <ArenaSectionHeader
                title="토론이 진행중인 투기장"
                href="/arena?status=3"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 px-6">
                <DebatingArenaCard
                    title="싱글플레이어vs멀티플레이어 게임의 미래"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorTierImageUrl="/icons/platinum.svg"
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerTierImageUrl="/icons/bronze.svg"
                    debateEndDate={new Date()}
                />
                <DebatingArenaCard
                    title="콘솔 vs PC 게이밍 진영 논쟁"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorTierImageUrl="/icons/platinum.svg"
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerTierImageUrl="/icons/bronze.svg"
                    debateEndDate={new Date()}
                />
                <DebatingArenaCard
                    title="과금 게임이 공정할 수 있는가?"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorTierImageUrl="/icons/platinum.svg"
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerTierImageUrl="/icons/bronze.svg"
                    debateEndDate={new Date()}
                />
            </div>
        </div>
    );
}
