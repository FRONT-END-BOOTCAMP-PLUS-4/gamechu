// hooks/useNotifications.ts
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys } from "@/lib/queryKeys";
import type { NotificationRecordListDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordListDto";

/**
 * Extracted from NotificationModal.tsx.
 * Endpoint param is 'currentPage' (matches /api/member/notification-records route).
 * refetchOnWindowFocus disabled — notifications fetched on modal open; focus refetch is noisy.
 */
export function useNotifications(currentPage: number = 1) {
    return useQuery<NotificationRecordListDto>({
        queryKey: queryKeys.notifications(currentPage),
        queryFn: () =>
            fetcher<NotificationRecordListDto>(
                `/api/member/notification-records?currentPage=${currentPage}`
            ),
        refetchOnWindowFocus: false,
    });
}
