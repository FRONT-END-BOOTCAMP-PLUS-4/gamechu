import { useState } from "react";

interface UseVoteResult {
    submitVote: (arenaId: number, votedTo: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export function useVote(): UseVoteResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitVote = async (arenaId: number, votedTo: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/arenas/${arenaId}/votes`, {
                method: "POST",
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

    return { submitVote, loading, error };
}
