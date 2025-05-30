import { useEffect, useState } from "react";
import ArenaSectionHeader from "./ArenaSectionHeader";
import VotingArenaCard from "./VotingArenaCard";
import { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";

export default function VotingArenaSection() {
    const [arenaListDto, setArenaListDto] = useState<ArenaListDto>();

    useEffect(() => {
        const fetchArenas = async () => {
            try {
                const res = await fetch(
                    `/api/arenas?currentPage=1&status=4&mine=false&pageSize=3`,
                    {
                        method: "GET",
                    }
                );
                const data = await res.json();
                setArenaListDto(data);
            } catch (error: unknown) {
                console.error("Failed to fetch arenas", error);
            }
        };

        fetchArenas();
    }, []);

    console.log(arenaListDto);

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
                        <VotingArenaCard key={arena.id} {...arena} />
                    ))
                )}
            </div>
        </div>
    );
}
