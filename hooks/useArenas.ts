// hooks/useArenas.ts
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys, type ArenasQueryParams } from "@/lib/queryKeys";
import type { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";

export type { ArenasQueryParams };

export default function useFetchArenas({
    currentPage = 1,
    status,
    mine = false,
    pageSize = 10,
    targetMemberId,
}: ArenasQueryParams) {
    const params = new URLSearchParams({
        currentPage: currentPage.toString(),
        pageSize: pageSize.toString(),
        status: status.toString(),
    });

    if (targetMemberId) {
        params.set("memberId", targetMemberId);
    } else {
        params.set("mine", mine.toString());
    }

    const { data, error, isLoading } = useQuery<ArenaListDto>({
        queryKey: queryKeys.arenas({ currentPage, status, mine, pageSize, targetMemberId }),
        queryFn: () => fetcher<ArenaListDto>(`/api/arenas?${params.toString()}`),
    });

    return {
        arenaListDto: data ?? null,
        setArenaListDto: () => {}, // retained for API compatibility — no-op after migration
        loading: isLoading,
        error: error ?? null,
    };
}
