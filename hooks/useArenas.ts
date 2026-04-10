// hooks/useArenas.ts
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys, type ArenasQueryParams } from "@/lib/QueryKeys";
import type { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";

export default function useFetchArenas(
    {
        currentPage = 1,
        status,
        mine = false,
        pageSize = 10,
        targetMemberId,
    }: ArenasQueryParams,
    options?: { refetchInterval?: number }
) {
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
        queryKey: queryKeys.arenas({
            currentPage,
            status,
            mine,
            pageSize,
            targetMemberId,
        }),
        queryFn: () =>
            fetcher<ArenaListDto>(`/api/arenas?${params.toString()}`),
        refetchInterval: options?.refetchInterval,
    });

    return {
        arenaListDto: data ?? null,
        loading: isLoading,
        error: error ?? null,
    };
}
