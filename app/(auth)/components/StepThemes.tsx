"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import { Theme } from "@/prisma/generated";

type Props = {
    onNext: () => void;
    onBack: () => void;
}

export default function StepThemes({ onNext, onBack }: Props) {
    const [selectedThemeIds, setSelectedThemeIds] = useState<number[]>([]);
    const [toast, setToast] = useState({ show: false, status: "error" as const, message: "" });

    const { data: themes = [] } = useQuery<Theme[]>({
        queryKey: queryKeys.themes(),
        queryFn: () => fetcher("/api/themes"),
    });

    const { mutate: saveThemes } = useMutation({
        mutationFn: () =>
            fetch("/api/preferred-themes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeIds: selectedThemeIds }),
            }).then((res) => {
                if (!res.ok) throw new Error("선호 테마 저장에 실패했습니다.");
            }),
        onSuccess: () => onNext(),
        onError: () => setToast({ show: true, status: "error", message: "선호 테마 저장에 실패했습니다." }),
    });

    const toggleTheme = (themeId: number) => {
        setSelectedThemeIds((prev) =>
            prev.includes(themeId)
                ? prev.filter((id) => id !== themeId)
                : [...prev, themeId]
        );
    };

    const handleNext = () => {
        if (selectedThemeIds.length === 0) {
            onNext();
            return;
        }
        saveThemes();
    };

    return (
        <div>
            <h2 className="text-body text-font-100 font-semibold mb-2">
                선호하는 게임 테마를 선택해주세요
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {themes.map((theme) => (
                    <SelectionCard
                        key={theme.id}
                        label={theme.name}
                        selected={selectedThemeIds.includes(theme.id)}
                        onClick={() => toggleTheme(theme.id)}
                    />
                ))}
            </div>

            <Toast show={toast.show} status={toast.status} message={toast.message} />

            <div className="flex justify-between mt-8">
                <Button
                    label="← 이전"
                    size="medium"
                    type="black"
                    onClick={onBack}
                />
                <Button
                    label="다음 →"
                    size="medium"
                    type="purple"
                    onClick={handleNext}
                />
            </div>
        </div>
    );
}
