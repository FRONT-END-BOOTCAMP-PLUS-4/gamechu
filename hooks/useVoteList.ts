import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys } from "@/lib/queryKeys";
import type { VoteDto } from "@/backend/vote/application/usecase/dto/VoteDto";

type UseVoteListProps = {
    arenaIds: number[];
};

export default function useVoteList({ arenaIds }: UseVoteListProps) {
    // Sort for a stable cache key — callers should wrap arenaIds in useMemo
    // to avoid new array references triggering re-fetches on each render.
    const sortedIds = [...arenaIds].sort((a, b) => a - b);

    const { data, isLoading, error } = useQuery<VoteDto[]>({
        queryKey: queryKeys.voteList(sortedIds),
        queryFn: async () => {
            const results = await Promise.all(
                sortedIds.map((id) =>
                    fetcher<VoteDto>(`/api/arenas/${id}/votes`)
                )
            );
            return results;
        },
        enabled: arenaIds.length > 0,
        refetchOnWindowFocus: false,
    });

    return {
        voteResult: data ?? [],
        loading: isLoading,
        error: error ?? null,
    };
}
