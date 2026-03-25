// app/(base)/games/[gameId]/components/WishlistButtonClient.tsx
"use client";

import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistButtonClient({
    gameId,
    viewerId,
}: {
    gameId: number;
    viewerId: string;
}) {
    // Hook must be called before any early return (Rules of Hooks).
    // viewerId="" when unauthenticated — !!'' is false, so useWishlist disables its query.
    const { isWished, isLoading, toggle } = useWishlist(gameId, viewerId);

    if (!viewerId) return null;

    const handleToggle = async () => {
        try {
            await toggle();
        } catch {
            alert("처리에 실패했습니다.");
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`group relative flex items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 sm:px-8 sm:py-3 sm:text-sm ${
                isWished
                    ? "border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-500/30 hover:bg-purple-500"
                    : "border-gray-600 bg-gray-800/40 text-gray-300 backdrop-blur-sm hover:border-purple-500/50 hover:bg-gray-800/60 hover:text-purple-400"
            } min-w-[120px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-80 sm:min-w-[140px]`}
        >
            <div className="relative flex h-4 w-4 items-center justify-center">
                {isLoading ? (
                    <svg
                        className="h-4 w-4 animate-spin text-current"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                        {isWished ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-4 w-4"
                            >
                                <path d="M5.25 5.625c0-1.036.84-1.875 1.875-1.875h10.5c1.036 0 1.875.84 1.875 1.875v16.875a.375.375 0 01-.584.312l-7.166-4.777-7.166 4.777a.375.375 0 01-.584-.312V5.625z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                                />
                            </svg>
                        )}
                    </span>
                )}
            </div>
            <span className="inline-block text-center">
                {isLoading
                    ? "처리 중..."
                    : isWished
                      ? "위시리스트 삭제"
                      : "위시리스트 담기"}
            </span>
        </button>
    );
}
