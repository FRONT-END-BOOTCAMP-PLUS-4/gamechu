"use client";

import { useEffect, useState } from "react";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";
import { Platform } from "@/prisma/generated";

interface Props {
    onSubmit: () => void;
    onBack: () => void;
}

export default function StepPlatforms({ onSubmit, onBack }: Props) {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [selectedPlatformIds, setSelectedPlatformIds] = useState<number[]>([]);

    // ✅ 플랫폼 데이터 가져오기
    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const res = await fetch("/api/platforms");
                const data: Platform[] = await res.json();
                setPlatforms(data);
            } catch (e) {
                console.error("플랫폼 불러오기 실패", e);
            }
        };

        fetchPlatforms();
    }, []);

    const togglePlatform = (platformId: number) => {
        setSelectedPlatformIds((prev) =>
            prev.includes(platformId)
                ? prev.filter((id) => id !== platformId)
                : [...prev, platformId]
        );
    };

    const handleSubmit = async () => {
        if (selectedPlatformIds.length === 0) {
            onSubmit();
            return;
        }

        try {
            const res = await fetch("/api/preferred-platforms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    platformIds: selectedPlatformIds,
                }),
            });

            if (res.ok) {
                onSubmit();
            } else {
                alert("선호 플랫폼 저장에 실패했습니다.");
            }
        } catch (err) {
            console.error("API 호출 오류:", err);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <h2 className="text-body text-font-100 font-semibold mb-2">
                이용하는 게임 플랫폼을 선택해주세요
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {platforms.map((platform) => (
                    <SelectionCard
                        key={platform.id}
                        label={platform.name}
                        selected={selectedPlatformIds.includes(platform.id)}
                        onClick={() => togglePlatform(platform.id)}
                    />
                ))}
            </div>

            <div className="flex justify-between mt-8">
                <Button
                    label="← 이전"
                    size="medium"
                    type="black"
                    onClick={onBack}
                />
                <Button
                    label="가입 완료"
                    size="medium"
                    type="purple"
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
}
