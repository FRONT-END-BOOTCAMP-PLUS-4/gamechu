import useArenas from "@/hooks/useArenas";
import ArenaSectionHeader from "./ArenaSectionHeader";
import CompleteArenaCard from "./CompleteArenaCard";

export default function CompleteArenaSection() {
    const { arenaListDto, loading, error } = useArenas({
        status: 5,
        currentPage: 1,
        mine: false,
        pageSize: 2,
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
            <ArenaSectionHeader title="종료된 투기장" status={5} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 px-6">
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        종료된 투기장이 없습니다.
                    </div>
                ) : (
                    arenaListDto!.arenas.map((arena) => (
                        <CompleteArenaCard key={arena.id} {...arena} />
                    ))
                )}
            </div>
        </div>
    );
}
