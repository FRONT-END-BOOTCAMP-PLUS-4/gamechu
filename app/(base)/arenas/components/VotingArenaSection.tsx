import ArenaSectionHeader from "./ArenaSectionHeader";
import VotingArenaCard from "./VotingArenaCard";
import useArenas from "@/hooks/useArenas";

export default function VotingArenaSection() {
    const { arenaListDto, loading, error } = useArenas({
        status: 4,
        currentPage: 1,
        mine: false,
        pageSize: 3,
    });

    // TODO: use Loading Page
    if (loading) {
        return (
            <div className="col-span-3 text-center text-gray-400">
                로딩중...
            </div>
        );
    }
    // TODO: use Error Page
    if (error) {
        return (
            <div className="col-span-3 text-center text-red-500">
                투기장 정보를 불러오는 데 실패했습니다. 나중에 다시
                시도해주세요.
            </div>
        );
    }

    return (
        <div>
            <ArenaSectionHeader
                title="투표가 진행중인 투기장"
                href="/arena?status=4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 px-6">
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        현재 투표가 진행중인 투기장이 없습니다.
                    </div>
                ) : (
                    arenaListDto!.arenas.map((arena) => (
                        <VotingArenaCard
                            key={arena.id}
                            {...arena}
                            voteEndDate={new Date(arena.voteEndDate)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
