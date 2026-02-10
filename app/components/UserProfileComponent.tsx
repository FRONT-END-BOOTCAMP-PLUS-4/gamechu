// app/components/UserProfileComponent.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import TierBadge from "@/app/components/TierBadge";
import { ReactNode } from "react";

interface UserProfileComponentProps {
    profileImage: string;
    nickname: string;
    score?: number;
    upperSlot?: ReactNode;
    bottomSlot?: ReactNode;
}

export default function UserProfileComponent({
    profileImage,
    nickname,
    score,
    upperSlot,
    bottomSlot,
}: UserProfileComponentProps) {
    const router = useRouter();

    return (
        <div className="flex items-start gap-2">
            {/* 프로필 이미지 */}
            <div className="h-[44px] w-[44px] flex-shrink-0 overflow-hidden rounded-full border border-line-100">
                <Image
                    src={profileImage}
                    alt="profile"
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                    unoptimized
                />
            </div>

            {/* 텍스트 컬럼 */}
            <div className="flex flex-col">
                {/* 👆 Upper Slot */}
                {upperSlot}

                {/* 닉네임 + 티어 */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                `/profile/${encodeURIComponent(nickname)}`
                            )
                        }
                        className="max-w-fit truncate text-left text-sm font-semibold text-font-100 hover:underline lg:text-base"
                    >
                        {nickname}
                    </button>

                    {typeof score === "number" && <TierBadge score={score} />}
                </div>

                {/* 👇 Bottom Slot */}
                {bottomSlot}
            </div>
        </div>
    );
}
