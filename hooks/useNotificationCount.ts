import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";

export function useNotificationCount() {
    return useQuery<{ count: number }>({
        queryKey: queryKeys.notificationCount(),
        queryFn: () => fetcher<{ count: number }>("/api/member/notification-records/count"),
        refetchOnWindowFocus: false,
    });
}
