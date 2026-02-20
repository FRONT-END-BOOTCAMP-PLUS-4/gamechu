// app/components/UserProfileComponent.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import TierBadge from "@/app/components/TierBadge";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";

interface UserProfileComponentProps {
    profileImage: string;
    nickname: string;
    score?: number;
}

export default function UserProfileComponent({
    profileImage,
    nickname,
    score,
}: UserProfileComponentProps) {
    const router = useRouter();

    const handleClick = async () => {
        try {
            // 로그인 안 했으면 그냥 이동
            const myUserId = await getAuthUserId();
            if (!myUserId) {
                router.push(`/profile/${encodeURIComponent(nickname)}`);
                return;
            }

            // 내 프로필 조회
            const res = await fetch("/api/member/profile");
            if (!res.ok) throw new Error("Failed to fetch my profile");

            const myProfile = await res.json();

            // ✅ 핵심 변경 포인트
            // "지금 클릭한 닉네임 === 내 닉네임?"
            if (myProfile.nickname === nickname) {
                router.push(`/profile`);
                return;
            }

            // 다른 사람 프로필
            router.push(`/profile/${encodeURIComponent(nickname)}`);
        } catch (error) {
            console.error("[PROFILE_CLICK_ERROR]", error);
            router.push(`/profile/${encodeURIComponent(nickname)}`);
        }
    };

    return (
        <div className="flex items-start gap-2">
            {/* 프로필 이미지 */}
            <button
                type="button"
                onClick={handleClick}
                className="h-[44px] w-[44px] flex-shrink-0 overflow-hidden rounded-full border border-line-100"
            >
                <Image
                    src={profileImage}
                    alt="profile"
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                    unoptimized
                />
            </button>

            {/* 텍스트 영역 */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleClick}
                        className="max-w-fit truncate text-left text-sm font-semibold text-font-100 hover:underline lg:text-base"
                    >
                        {nickname}
                    </button>

                    {typeof score === "number" && <TierBadge score={score} />}
                </div>
            </div>
        </div>
    );
}
