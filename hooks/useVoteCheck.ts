import { useState, useEffect, useCallback } from "react";

export function useVoteCheck(arenaId: number | undefined) {
    const [existingVote, setExistingVote] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVote = useCallback(() => {
        if (!arenaId) return;

        setLoading(true);
        setError(null);

        fetch(`/api/arenas/${arenaId}/votes/check`)
            .then((res) => {
                if (!res.ok) throw new Error("투표 상태 조회 실패");
                return res.json();
            })
            .then((data) => {
                setExistingVote(data?.result ?? null);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [arenaId]);

    useEffect(() => {
        fetchVote();
    }, [fetchVote]);

    return { existingVote, loading, error, refetch: fetchVote };
}
