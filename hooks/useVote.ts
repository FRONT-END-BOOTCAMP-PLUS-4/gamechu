// hooks/useVoteData.ts
import { VoteDto } from "@/backend/vote/application/usecase/dto/VoteDto";
import { useCallback, useEffect, useState } from "react";

type GetVoteParams = {
    arenaId: number;
    votedTo?: string;
    mine: boolean;
};

export function useVote({ arenaId, votedTo, mine }: GetVoteParams) {
    const [voteData, setVoteData] = useState<VoteDto | null>(null);
    const [existingVote, setExistingVote] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVoteData = useCallback(async () => {
        if (!arenaId) return;
        setLoading(true);
        try {
            const query = new URLSearchParams({
                ...(votedTo !== undefined ? { votedTo: votedTo } : {}),
                ...(mine ? { mine: "true" } : {}),
            }).toString();

            const res = await fetch(`/api/arenas/${arenaId}/votes?${query}`);
            if (!res.ok) throw new Error("Failed to fetch vote data");
            const data = await res.json();
            if (mine) {
                const myVote = data?.votes?.[0];
                setExistingVote(myVote?.votedTo ?? null);
            } else {
                setExistingVote(null);
            }
            setVoteData(data);
            console.log("vote data", data);
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
    }, [arenaId, votedTo, mine]);

    const submitVote = async (
        arenaId: number,
        votedTo: string,
        existingVote: string | null
    ) => {
        setLoading(true);
        setError(null);

        try {
            const method = existingVote ? "PATCH" : "POST";

            const res = await fetch(`/api/member/arenas/${arenaId}/votes`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ arenaId, votedTo }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "투표에 실패했습니다.");
            }

            // 성공 후 처리 (필요하다면 콜백 등 추가 가능)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVoteData();
    }, [fetchVoteData]);

    return {
        voteData,
        existingVote,
        loading,
        error,
        refetch: fetchVoteData,
        submitVote,
    };
}
