// components/tabs/ProfileReviewTab.tsx
"use client";

import MemberReviewList from "../MemberReviewList";

interface MemberReviewItem {
  id: number;
  gameId: number;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string | null;
  gameTitle: string;
  imageUrl: string | null;
}

export default function ProfileReviewTab({ reviews }: { reviews: MemberReviewItem[] }) {
  return (
    <div className="w-full">
      <MemberReviewList reviews={reviews} />
    </div>
  );
}
