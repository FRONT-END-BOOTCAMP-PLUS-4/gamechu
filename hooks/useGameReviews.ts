// hooks/useGameReviews.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";

type Review = {
    id: number;
    memberId: string;
    profileImage: string;
    nickname: string;
    date: string;
    tier: string;
    rating: number;
    comment: string;
    likes: number;
    isLiked: boolean;
    score: number;
};

type RawReview = {
    id: number;
    memberId: string;
    imageUrl?: string;
    nickname?: string;
    createdAt: string;
    score: number;
    rating: number;
    content: string;
    likeCount?: number;
    isLiked?: boolean;
};

function enrichReview(r: RawReview): Review {
    return {
        id: r.id,
        memberId: r.memberId,
        profileImage:
            r.imageUrl && r.imageUrl.startsWith("data:")
                ? r.imageUrl
                : r.imageUrl || "/icons/profile.svg",
        nickname: r.nickname ?? "유저",
        date: new Date(r.createdAt).toLocaleDateString("ko-KR"),
        tier: String(r.score),
        rating: r.rating / 2,
        comment: r.content,
        likes: r.likeCount ?? 0,
        isLiked: r.isLiked ?? false,
        score: r.score ?? 0,
    };
}

/**
 * Extracted from ClientContentWrapper.tsx.
 * refetchOnWindowFocus disabled — review content is heavy (Lexical JSON).
 * No 'refetch' in return: Comment.onSuccess should call invalidateQueries directly.
 */
export function useGameReviews(gameId: number) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<Review[]>({
        queryKey: queryKeys.reviews(gameId),
        queryFn: async () => {
            const raw = await fetcher<RawReview[]>(
                `/api/games/${gameId}/reviews`
            );
            return raw.map(enrichReview);
        },
        refetchOnWindowFocus: false,
    });

    const { mutateAsync: deleteReview } = useMutation({
        mutationFn: (reviewId: number) =>
            fetch(`/api/member/games/${gameId}/reviews/${reviewId}`, {
                method: "DELETE",
            }).then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        (body as { message?: string }).message ??
                            "댓글 삭제 실패"
                    );
                }
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews(gameId),
            }),
    });

    return {
        reviews: data ?? [],
        isLoading,
        deleteReview,
        // No 'refetch' or 'invalidateReviews' exposed — Comment.onSuccess calls
        // queryClient.invalidateQueries directly via useQueryClient() in the component.
    };
}
