// hooks/useVote.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
import type { VoteListDto } from "@/backend/vote/application/usecase/dto/VoteListDto";

type GetVoteParams = {
    arenaId: number;
    mine: boolean;
};

type SubmitVoteParams = {
    arenaId: number;
    votedTo: string;
    existingVote: string | null;
};

export function useVote({ arenaId, mine }: GetVoteParams) {
    const queryClient = useQueryClient();

    const queryKey = mine
        ? queryKeys.arenaVotesMine(arenaId)
        : queryKeys.arenaVotes(arenaId);

    const query = new URLSearchParams({
        ...(mine ? { mine: "true" } : {}),
    }).toString();

    const { data, isLoading, error } = useQuery<VoteListDto>({
        queryKey,
        queryFn: () =>
            fetcher<VoteListDto>(`/api/arenas/${arenaId}/votes?${query}`),
        enabled: !!arenaId,
    });

    const { mutateAsync: submitVote, isPending } = useMutation<
        unknown,
        Error,
        SubmitVoteParams
    >({
        mutationFn: ({ arenaId, votedTo, existingVote }) =>
            fetch(`/api/member/arenas/${arenaId}/votes`, {
                method: existingVote ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ arenaId, votedTo }),
            }).then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        (body as { message?: string }).message ??
                            "투표에 실패했습니다."
                    );
                }
                return res.json();
            }),
        // Prefix-match: invalidates both arenaVotes and arenaVotesMine in one call
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.arenaVotes(arenaId),
            }),
    });

    return {
        voteData: data ?? null,
        existingVote: mine ? (data?.votes?.[0]?.votedTo ?? null) : null,
        loading: isLoading || isPending,
        error: error?.message ?? null,
        submitVote,
    };
}
