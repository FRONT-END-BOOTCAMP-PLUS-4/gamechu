"use client";
import Image from "next/image";
import Button from "@/app/components/Button";

export default function ArenaIntroCard() {
    return (
        <div className="px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Image
                        src="/icons/arena2.svg"
                        alt="투기장 아이콘"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                    <h1 className="text-3xl font-semibold text-font-100">
                        토론 투기장
                    </h1>
                </div>
                <p className="text-font-300 text-sm text-gray-400">
                    게임에 대한 열띤 토론의 장입니다. 자신의 의견을 피력하고
                    다른 게이머들과 논쟁을 벌여보세요. 토론에서 승리하여 최고의
                    평론가로 인정받으세요.
                </p>
            </div>
            <Button
                label="도전장 작성하기"
                type="purple"
                size="large"
                icon={
                    <Image
                        src="/icons/arena2-white.svg"
                        alt="투기장 아이콘"
                        width={16}
                        height={16}
                        className="object-contain"
                    />
                }
            />
        </div>
    );
}
