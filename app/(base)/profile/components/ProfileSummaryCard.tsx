"use client";

import Image from "next/image";

type ProfileSummaryCardProps =
    | {
          isOwnProfile: true;
          nickname: string;
          imageUrl: string | null;
          score: number;
          reviewCount: number;
          wishlistCount: number;
          createdAt: string;
      }
    | {
          isOwnProfile: false;
          nickname: string;
          imageUrl: string | null;
          score: number;
          reviewCount: number;
      };

export default function ProfileSummaryCard(props: ProfileSummaryCardProps) {
    const { nickname, imageUrl, score, reviewCount, isOwnProfile } = props;

    return (
        <div
            className={[
                "w-full rounded-xl bg-background-300 p-6 shadow md:w-[250px]",
                isOwnProfile ? "md:h-[320px]" : "md:h-[270px]",
            ].join(" ")}
        >
            <div className="mx-auto mb-4 h-[120px] w-[120px] overflow-hidden rounded-full">
                <Image
                    src={imageUrl || "/icons/arena.svg"}
                    alt="프로필 이미지"
                    width={120}
                    height={120}
                />
            </div>
            <h2 className="min-h-[24px] text-center text-body font-semibold">
                {nickname || (
                    <span className="text-font-200">닉네임 불러오는 중</span>
                )}
            </h2>
            {isOwnProfile && (
                <p className="mt-1 min-h-[20px] text-center text-caption text-font-200">
                    가입일: {props.createdAt || "-"}
                </p>
            )}
            <div className="mt-4 space-y-1 text-sm">
                <p className="flex min-h-[20px] justify-between">
                    <span>포인트</span>
                    <span className="font-semibold">
                        {score !== undefined ? score : "-"}
                    </span>
                </p>
                <p className="flex min-h-[20px] justify-between">
                    <span>리뷰</span>
                    <span className="font-semibold">
                        {reviewCount !== undefined ? reviewCount : "-"}
                    </span>
                </p>
                {isOwnProfile && (
                    <p className="flex min-h-[20px] justify-between">
                        <span>위시리스트</span>
                        <span className="font-semibold">
                            {props.wishlistCount !== undefined
                                ? props.wishlistCount
                                : "-"}
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
}
