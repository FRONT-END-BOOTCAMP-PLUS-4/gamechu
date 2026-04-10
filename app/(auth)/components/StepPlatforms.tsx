"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import { Platform } from "@/prisma/generated";

type Props = {
    onSubmit: () => void;
    onBack: () => void;
};

export default function StepPlatforms({ onSubmit, onBack }: Props) {
    const [selectedPlatformIds, setSelectedPlatformIds] = useState<number[]>(
        []
    );
    const [toast, setToast] = useState({
        show: false,
        status: "error" as const,
        message: "",
    });

    const { data: platforms = [] } = useQuery<Platform[]>({
        queryKey: queryKeys.platforms(),
        queryFn: () => fetcher("/api/platforms"),
    });

    const { mutate: savePlatforms } = useMutation({
        mutationFn: () =>
            fetch("/api/preferred-platforms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platformIds: selectedPlatformIds }),
            }).then((res) => {
                if (!res.ok)
                    throw new Error("선호 플랫폼 저장에 실패했습니다.");
            }),
        onSuccess: () => onSubmit(),
        onError: () =>
            setToast({
                show: true,
                status: "error",
                message: "선호 플랫폼 저장에 실패했습니다.",
            }),
    });

    const togglePlatform = (platformId: number) => {
        setSelectedPlatformIds((prev) =>
            prev.includes(platformId)
                ? prev.filter((id) => id !== platformId)
                : [...prev, platformId]
        );
    };

    const handleSubmit = () => {
        if (selectedPlatformIds.length === 0) {
            onSubmit();
            return;
        }
        savePlatforms();
    };

    return (
        <div>
            <h2 className="mb-2 text-body font-semibold text-font-100">
                이용하는 게임 플랫폼을 선택해주세요
            </h2>

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {platforms.map((platform) => (
                    <SelectionCard
                        key={platform.id}
                        label={platform.name}
                        selected={selectedPlatformIds.includes(platform.id)}
                        onClick={() => togglePlatform(platform.id)}
                    />
                ))}
            </div>

            <Toast
                show={toast.show}
                status={toast.status}
                message={toast.message}
            />

            <div className="mt-8 flex justify-between">
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
