import ArenaSectionHeader from "./ArenaSectionHeader";
import WaitingArenaCard from "./WaitingArenaCard";

export default function WaitingArenaSection() {
    return (
        <div>
            <ArenaSectionHeader
                title="대기중인 투기장"
                href="/arena?status=2"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 px-6">
                <WaitingArenaCard
                    title="싱글플레이어vs멀티플레이어 게임의 미래"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorScore={3500}
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerScore={1500}
                    startDate={new Date()}
                />
                <WaitingArenaCard
                    title="콘솔 vs PC 게이밍 진영 논쟁"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorScore={3500}
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerScore={2200}
                    startDate={new Date()}
                />
                <WaitingArenaCard
                    title="과금 게임이 공정할 수 있는가?"
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorScore={5200}
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerScore={2200}
                    startDate={new Date()}
                />
            </div>
        </div>
    );
}
