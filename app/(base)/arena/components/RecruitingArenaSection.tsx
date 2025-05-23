import ArenaSectionHeader from "./ArenaSectionHeader";
import RecruitingArenaCard from "./RecruitingArenaCard";

export default function RecruitingArenaSection() {
    return (
        <div>
            <ArenaSectionHeader
                title="도전자를 찾는중인 투기장"
                href="/arena?status=1"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 px-6">
                <RecruitingArenaCard
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorScore={3500}
                    title="오픈월드 게임의 사이드 퀘스트는 메인 스토리만큼 중요하다."
                    description="사이드 퀘스트는 게임 세계를 풍부하게 만들어주고 플레이어들에게 더 깊은 몰입감을 제공합니다. 반대 의견 있으신가요?"
                    startDate={new Date()}
                />
                <RecruitingArenaCard
                    creatorNickname="겜잘알"
                    creatorProfileImageUrl="/icons/arena2.svg"
                    creatorScore={4500}
                    title="오픈월드 게임의 사이드 퀘스트는 메인 스토리만큼 중요하다."
                    description="사이드 퀘스트는 게임 세계를 풍부하게 만들어주고 플레이어들에게 더 깊은 몰입감을 제공합니다. 반대 의견 있으신가요?"
                    startDate={new Date()}
                />
            </div>
        </div>
    );
}
