import { useEffect, useRef, useState } from "react";
import { VoteCountResult } from "@/backend/vote/application/usecase/VoteCountUsecase";

type UseVoteListProps = {
    arenaIds: number[];
};

export default function useVoteList({ arenaIds }: UseVoteListProps) {
    const [voteResult, setVoteResult] = useState<VoteCountResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    // Use a ref to track the last fetched arena IDs to avoid unnecessary re-fetching
    const fetchedIdsRef = useRef<string>("");

    useEffect(() => {
        const sortedIds: number[] = [...arenaIds].sort((a, b) => a - b);
        const idsString: string = JSON.stringify(sortedIds);

        // don't fetch if arenaIds is empty
        if (!arenaIds.length || idsString === fetchedIdsRef.current) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // TODO: apply changes of api/arenas to deal with multiple arenaIds
                const results = await Promise.all(
                    arenaIds.map(async (id) => {
                        const res = await fetch(`/api/arenas/${id}/votes`);
                        if (!res.ok)
                            throw new Error(`Fetch failed for arena ${id}`);
                        return res.json();
                    })
                );
                setVoteResult(results);
                // update fetchedIdsRef
                fetchedIdsRef.current = idsString;
            } catch (err) {
                if (err instanceof Error) setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [arenaIds]);

    return { voteResult, loading, error };
}
