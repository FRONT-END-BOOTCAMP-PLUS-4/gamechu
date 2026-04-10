// hooks/useWishlist.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";

type WishlistStatus = {
    exists: boolean;
    wishlistId: number | null;
};

/**
 * Extracted from WishlistButtonClient.tsx.
 *
 * viewerId: string — caller passes "" when unauthenticated (!!'' = false disables query).
 *
 * wishlistId threading: read synchronously from cache data at mutation time.
 * After POST, setQueryData applies an optimistic update before invalidation refetch.
 */
export function useWishlist(gameId: number, viewerId: string) {
    const queryClient = useQueryClient();
    const key = queryKeys.wishlist(gameId);

    const { data, isLoading } = useQuery<WishlistStatus>({
        queryKey: key,
        queryFn: () =>
            fetcher<WishlistStatus>(`/api/member/wishlists?gameId=${gameId}`),
        enabled: !!viewerId,
        refetchOnWindowFocus: false,
    });

    const { mutateAsync: toggle, isPending } = useMutation({
        mutationFn: async () => {
            const current =
                queryClient.getQueryData<WishlistStatus>(key) ?? data;
            if (current?.exists && current.wishlistId !== null) {
                await fetch(`/api/member/wishlists/${gameId}`, {
                    method: "DELETE",
                }).then(async (res) => {
                    if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(
                            (body as { message?: string }).message ??
                                "위시리스트 삭제 실패"
                        );
                    }
                });
                return { exists: false, wishlistId: null } as WishlistStatus;
            } else {
                const res = await fetch("/api/member/wishlists", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ gameId }),
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        (body as { message?: string }).message ??
                            "위시리스트 등록 실패"
                    );
                }
                const { wishlistId } = await res.json();
                return { exists: true, wishlistId } as WishlistStatus;
            }
        },
        onSuccess: (newStatus) => {
            // Optimistic cache update before invalidation refetch completes
            queryClient.setQueryData<WishlistStatus>(key, newStatus);
            queryClient.invalidateQueries({ queryKey: key });
        },
    });

    return {
        isWished: data?.exists ?? false,
        isLoading: isLoading || isPending,
        toggle,
    };
}
