"use client";

import { useEffect, useState } from "react";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";

interface Props {
    onNext: () => void;
    onBack: () => void;
}

interface Theme {
    id: number;
    name: string;
}

export default function StepThemes({ onNext, onBack }: Props) {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedThemeIds, setSelectedThemeIds] = useState<number[]>([]);

    // ✅ 테마 데이터 가져오기
    useEffect(() => {
        const fetchThemes = async () => {
            try {
                const res = await fetch("/api/themes");
                const data: Theme[] = await res.json();
                setThemes(data);
            } catch (e) {
                console.error("테마 불러오기 실패", e);
            }
        };

        fetchThemes();
    }, []);

    const toggleTheme = (themeId: number) => {
        setSelectedThemeIds((prev) =>
            prev.includes(themeId)
                ? prev.filter((id) => id !== themeId)
                : [...prev, themeId]
        );
    };

    const handleNext = async () => {
        //선택 안했으면 그냥 다음
        if (selectedThemeIds.length === 0) {
            onNext();
            return;
        }

        try {
            const res = await fetch("/api/preferred-themes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    themeIds: selectedThemeIds, // ✅ memberId 제거
                }),
            });

            if (res.ok) {
                onNext();
            } else {
                alert("선호 테마 저장에 실패했습니다.");
            }
        } catch (err) {
            console.error("API 호출 오류:", err);
            alert("오류가 발생했습니다.");
        }
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
