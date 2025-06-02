import useArenas from "@/hooks/useArenas";
import ArenaSectionHeader from "./ArenaSectionHeader";
import CompleteArenaCard from "./CompleteArenaCard";
import useVoteList from "@/hooks/useVoteList";
import { useEffect, useRef, useState } from "react";

export default function CompleteArenaSection() {
    const {
        arenaListDto,
        loading: arenaLoading,
        error: arenaError,
    } = useArenas({
        status: 5,
        currentPage: 1,
        mine: false,
        pageSize: 2,
    });

    const [arenaIdsToFetch, setArenaIdsToFetch] = useState<number[]>([]);
    const fetchedIdsRef = useRef<string>(""); // API 중복 호출 방지용

    useEffect(() => {
        if (!arenaListDto?.arenas) return;

        const ids = arenaListDto.arenas.map((arena) => arena.id).sort();
        const idsString = ids.join(",");

        if (fetchedIdsRef.current === idsString) return;

        setArenaIdsToFetch(ids); // 필요한 ID 목록 업데이트
        fetchedIdsRef.current = idsString; // 기록 갱신
    }, [arenaListDto?.arenas]);

    const {
        voteResult,
        loading: voteLoading,
        error: voteError,
    } = useVoteList({
        arenaIds: arenaIdsToFetch,
    });

    if (arenaListDto && arenaListDto.arenas) {
        arenaListDto.arenas.forEach((arena) => {
            const vote = voteResult.find((vote) => vote.arenaId === arena.id);
            if (vote) {
                arena.voteCount = vote.total;
                arena.leftPercent = vote.leftPercent;
            } else {
                arena.voteCount = 0;
            }
        });
    }

    // TODO: use Loading Page
    if (arenaLoading || voteLoading) {
        return (
            <div className="col-span-3 text-center text-gray-400">
                로딩중...
            </div>
        );
    }

    // TODO: use Error Page
    if (arenaError || voteError) {
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
                    arenaListDto?.arenas.map((arena) => (
                        <CompleteArenaCard key={arena.id} {...arena} />
                    ))
                )}
            </div>
        </div>
    );
}

// import useArenas from "@/hooks/useArenas";
// import ArenaSectionHeader from "./ArenaSectionHeader";
// import CompleteArenaCard from "./CompleteArenaCard";
// import useVoteList from "@/hooks/useVoteList";

// export default function CompleteArenaSection() {
//     const {
//         arenaListDto,
//         loading: arenaLoading,
//         error: arenaError,
//     } = useArenas({
//         status: 5,
//         currentPage: 1,
//         mine: false,
//         pageSize: 2,
//     });

//     const {
//         voteResult,
//         loading: voteLoading,
//         error: voteError,
//     } = useVoteList({
//         arenaIds: arenaListDto?.arenas?.map((arena) => arena.id) ?? [],
//     });

//     const [arenaIdsToFetch, setArenaIdsToFetch] = useState<string[]>([]);
//     const fetchedIdsRef = useRef<string>("");

//     if (arenaListDto && arenaListDto.arenas) {
//         arenaListDto.arenas.forEach((arena) => {
//             const vote = voteResult.find((vote) => vote.arenaId === arena.id);
//             if (vote) {
//                 arena.voteCount = vote.total;
//                 arena.leftPercent = vote.leftPercent;
//             } else {
//                 arena.voteCount = 0;
//             }
//         });
//     }

//     // TODO: use Loading Page
//     if (arenaLoading || voteLoading) {
//         return (
//             <div className="col-span-3 text-center text-gray-400">
//                 로딩중...
//             </div>
//         );
//     }
//     // TODO: use Error Page
//     if (arenaError || voteError) {
//         return (
//             <div className="col-span-3 text-center text-red-500">
//                 투기장 정보를 불러오는 데 실패했습니다. 나중에 다시
//                 시도해주세요.
//             </div>
//         );
//     }

//     return (
//         <div>
//             <ArenaSectionHeader title="종료된 투기장" status={5} />
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 px-6">
//                 {arenaListDto?.arenas.length === 0 ? (
//                     <div className="col-span-3 text-center text-gray-500">
//                         종료된 투기장이 없습니다.
//                     </div>
//                 ) : (
//                     arenaListDto!.arenas.map((arena) => (
//                         <CompleteArenaCard key={arena.id} {...arena} />
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// }
