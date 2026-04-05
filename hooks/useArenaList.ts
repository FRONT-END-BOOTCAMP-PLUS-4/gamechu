// hooks/useArenaList.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/QueryKeys";
import { fetcher } from "@/lib/Fetcher";
import type { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

type ArenaListResponse = { success: boolean; data?: ArenaDetailDto[] };

export function useArenaList() {
    const { data, error, isLoading } = useQuery<ArenaDetailDto[]>({
        queryKey: queryKeys.arenaList(),
        queryFn: async () => {
            // Use fetcher so non-ok responses throw (consistent error handling)
            const json = await fetcher<ArenaListResponse>("/api/arenas");
            return json.success && Array.isArray(json.data) ? json.data : [];
        },
    });

    return {
        arenaList: data ?? [],
        loading: isLoading,
        error: error ?? null,
    };
}
