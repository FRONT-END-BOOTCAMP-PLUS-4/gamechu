// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClientContentWrapper from "../ClientContentWrapper";

// Mock useGameReviews
const mockDeleteReview = vi.fn();
vi.mock("@/hooks/useGameReviews", () => ({
    useGameReviews: vi.fn(() => ({
        reviews: [],
        isLoading: false,
        deleteReview: mockDeleteReview,
    })),
}));

// Mock react-query
vi.mock("@tanstack/react-query", () => ({
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}));

// Mock child components — CommentCard renders with memberId in data-testid
vi.mock("../CommentCard", () => ({
    default: ({
        memberId,
        nickname,
    }: {
        memberId: string;
        nickname: string;
    }) => (
        <div data-testid={`comment-card-${memberId}`} data-nickname={nickname} />
    ),
}));

vi.mock("../Comment", () => ({
    default: () => <div data-testid="comment-form" />,
}));

vi.mock("../ReviewSelector", () => ({
    default: ({
        onSelect,
    }: {
        onSelect: (type: "expert" | "user") => void;
    }) => (
        <div data-testid="review-selector">
            <button
                data-testid="user-tab-btn"
                onClick={() => onSelect("user")}
            />
        </div>
    ),
}));

vi.mock("@/app/components/Pager", () => ({
    default: () => <div data-testid="pager" />,
}));

// Import after mocks are set up
import { useGameReviews } from "@/hooks/useGameReviews";

const makeReview = (id: number, memberId: string, score = 5000) => ({
    id,
    memberId,
    profileImage: "/icons/profile.svg",
    nickname: `user-${memberId}`,
    date: "2024. 1. 1.",
    tier: String(score),
    rating: 4,
    comment: "good",
    likes: 0,
    isLiked: false,
    score,
});

describe("ClientContentWrapper — 중복 리뷰 버그", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("내 리뷰가 상단에 표시될 때 목록에는 중복되지 않는다", () => {
        // Given: viewer(member-1)의 전문가 리뷰 + 다른 전문가 리뷰 2개
        (useGameReviews as ReturnType<typeof vi.fn>).mockReturnValue({
            reviews: [
                makeReview(1, "member-1", 5000), // viewer's review (expert)
                makeReview(2, "member-2", 4500),
                makeReview(3, "member-3", 3500),
            ],
            isLoading: false,
            deleteReview: mockDeleteReview,
        });

        render(<ClientContentWrapper gameId={1} viewerId="member-1" />);

        // viewer의 CommentCard는 정확히 1번만 렌더링되어야 한다
        const myCards = screen.getAllByTestId("comment-card-member-1");
        expect(myCards).toHaveLength(1);
    });

    it("user 탭: user 티어 내 리뷰가 상단에 표시될 때 목록에는 중복되지 않는다", () => {
        // Given: viewer(member-1)의 user 티어 리뷰(score < 3000) + 다른 user 리뷰 2개
        (useGameReviews as ReturnType<typeof vi.fn>).mockReturnValue({
            reviews: [
                makeReview(1, "member-1", 1500), // viewer's review (user tier)
                makeReview(2, "member-2", 2000),
                makeReview(3, "member-3", 1000),
            ],
            isLoading: false,
            deleteReview: mockDeleteReview,
        });

        render(<ClientContentWrapper gameId={1} viewerId="member-1" />);

        // user 탭으로 전환
        fireEvent.click(screen.getByTestId("user-tab-btn"));

        // viewer의 CommentCard는 정확히 1번만 렌더링되어야 한다
        const myCards = screen.getAllByTestId("comment-card-member-1");
        expect(myCards).toHaveLength(1);
    });

    it("내 리뷰가 없으면 목록에 모든 리뷰가 표시된다", () => {
        // Given: viewer 리뷰 없음
        (useGameReviews as ReturnType<typeof vi.fn>).mockReturnValue({
            reviews: [
                makeReview(1, "member-2", 5000),
                makeReview(2, "member-3", 4500),
            ],
            isLoading: false,
            deleteReview: mockDeleteReview,
        });

        render(<ClientContentWrapper gameId={1} viewerId="member-1" />);

        expect(screen.getByTestId("comment-card-member-2")).toBeDefined();
        expect(screen.getByTestId("comment-card-member-3")).toBeDefined();
        // 작성 폼이 표시된다
        expect(screen.getByTestId("comment-form")).toBeDefined();
    });
});
