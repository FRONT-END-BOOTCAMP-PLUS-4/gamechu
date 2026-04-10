import useArenaStore from "@/stores/UseArenaStore";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/QueryKeys";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useArenaAutoStatusDetail(_props: {
    onStatusUpdate?: (newStatus: number) => void;
}) {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!arenaDetail?.id) return;
        const id = arenaDetail.id;

        // Server-side timers handle all status transitions (see lib/ArenaTimerRecovery.ts).
        // This hook only keeps the UI fresh by periodically re-fetching the arena detail.
        const interval = setInterval(() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.arenaDetail(id) });
        }, 30_000);
        return () => clearInterval(interval);
    }, [arenaDetail?.id, queryClient]);
}
