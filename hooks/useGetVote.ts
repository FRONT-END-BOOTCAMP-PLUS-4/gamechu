// hooks/useVoteData.ts
import { VoteDto } from "@/backend/vote/application/usecase/dto/VoteDto";
import { useCallback, useEffect, useState } from "react";

export function useGetVote(arenaId: number) {
    const [voteData, setVoteData] = useState<VoteDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVoteData = useCallback(async () => {
        if (!arenaId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/arenas/${arenaId}/votes`);
            if (!res.ok) throw new Error("Failed to fetch vote data");
            const data = await res.json();
            setVoteData(data);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 에러가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    }, [arenaId]);

    useEffect(() => {
        fetchVoteData();
    }, [fetchVoteData]);

    return { voteData, loading, error, refetch: fetchVoteData };
}
