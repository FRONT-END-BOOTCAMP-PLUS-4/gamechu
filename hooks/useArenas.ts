import { useEffect, useState } from "react";
import { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";

type FetchArenasParams = {
    currentPage?: number;
    status: number;
    mine: boolean;
    pageSize: number;
    targetMemberId?: string; // ⭐ 추가
};

export default function useFetchArenas({
    currentPage = 1,
    status,
    mine = false,
    pageSize = 10,
    targetMemberId,
}: FetchArenasParams) {
    const [arenaListDto, setArenaListDto] = useState<ArenaListDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams({
                    currentPage: currentPage.toString(),
                    pageSize: pageSize.toString(),
                    ...(status !== undefined
                        ? { status: status.toString() }
                        : {}),
                });

                // ⭐ 타 사용자 조회가 우선
                if (targetMemberId) {
                    params.set("memberId", targetMemberId);
                } else {
                    params.set("mine", mine.toString());
                }

                const res = await fetch(`/api/arenas?${params.toString()}`);
                const json = await res.json();
                setArenaListDto(json);
            } catch (error: unknown) {
                if (error instanceof Error) setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, status, mine, pageSize, targetMemberId]);

    return { arenaListDto, setArenaListDto, loading, error };
}
