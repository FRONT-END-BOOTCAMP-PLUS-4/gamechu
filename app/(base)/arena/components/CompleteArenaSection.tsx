import ArenaSectionHeader from "./ArenaSectionHeader";
import CompleteArenaCard from "./CompleteArenaCard";

export default function CompleteArenaSection() {
    return (
        <div>
            <ArenaSectionHeader title="종료된 투기장" href="/arena?status=5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 px-6">
                <CompleteArenaCard
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorScore={4100}
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerScore={3100}
                    title="오픈월드 게임의 사이드 퀘스트는 메인 스토리만큼 중요하다."
                    description="사이드 퀘스트는 게임 세계를 풍부하게 만들어주고 플레이어들에게 더 깊은 몰입감을 제공합니다. 반대 의견 있으신가요?"
                    leftPercent={40}
                />
                <CompleteArenaCard
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorScore={3100}
                    challengerNickname="분탕충"
                    challengerProfileImageUrl="/icons/arena2.svg"
                    challengerScore={4100}
                    title="콘솔 vs PC 게이밍 진영 논쟁"
                    description="PC 게이밍이 점점 발전해가며 콘솔보다 PC가 게이밍하기 더 좋은 환경이라는 의견이 나오고 있습니다. 저도 그렇게 생각하구요. 반박 환영합니다."
                    leftPercent={70}
                />
            </div>
        </div>
    );
}
