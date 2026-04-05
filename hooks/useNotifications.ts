// hooks/useNotifications.ts
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
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
