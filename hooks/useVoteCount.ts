// hooks/useVoteData.ts
import { useEffect, useState } from "react";

export interface VoteData {
    leftVotes: number;
    rightVotes: number;
    total: number;
    leftPercent: number;
}

export function useVoteCount(arenaId: number) {
    const [voteData, setVoteData] = useState<VoteData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!arenaId) return;

        setLoading(true);
        fetch(`/api/arenas/${arenaId}/votes`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch vote data");
                return res.json();
            })
            .then((data: VoteData) => {
                setVoteData(data);
                setError(null);
            })
            .catch((err) => {
                setError(err.message || "Unknown error");
                setVoteData(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [arenaId]);

    return { voteData, loading, error };
}
