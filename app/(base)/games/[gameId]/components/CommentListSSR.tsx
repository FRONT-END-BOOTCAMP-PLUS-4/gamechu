// app/game/[gameId]/components/CommentListSSR.tsx
import CommentCard from "./CommentCard";
import { GetReviewsByGameIdUsecase } from "@/backend/review/application/usecase/GetReviewsByGameIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";

export default async function CommentListSSR({
    gameId,
    viewerId,
}: {
    gameId: number;
    viewerId?: string;
}) {
    const reviewRepo = new PrismaReviewRepository();
    const likeRepo = new PrismaReviewLikeRepository();

    const usecase = new GetReviewsByGameIdUsecase(reviewRepo, likeRepo);
    const comments = await usecase.execute(gameId, viewerId || "");

    return (
        <div className="space-y-6">
            {comments.map((c) => (
                <CommentCard
                    key={c.id}
                    id={c.id}
                    profileImage={c.imageUrl ?? "/placeholder.svg"}
                    nickname={c.nickname}
                    date={new Date(c.createdAt).toLocaleDateString("ko-KR")}
                    rating={c.rating}
                    comment={c.content}
                    likes={c.likeCount}
                    score={c.score}
                    isLiked={c.isLiked}
                    viewerId={viewerId}
                    memberId={c.memberId}
                />
            ))}
        </div>
    );
}
