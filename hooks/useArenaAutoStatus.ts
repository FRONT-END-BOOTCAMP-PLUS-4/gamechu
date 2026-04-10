import { ArenaDto } from "@/backend/arena/application/usecase/dto/ArenaDto";
import { ArenaStatus } from "@/types/arena-status";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
    arenaList: ArenaDto[];
    onStatusUpdate?: (id: number, newStatus: ArenaStatus) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useArenaAutoStatus(_props: Props) {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Server-side timers handle all status transitions (see lib/ArenaTimerRecovery.ts).
        // This hook only keeps the UI fresh by periodically invalidating the arena list cache.
        const interval = setInterval(() => {
            queryClient.invalidateQueries({ queryKey: ["arenas"] });
            queryClient.invalidateQueries({ queryKey: ["arenaList"] });
        }, 30_000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
