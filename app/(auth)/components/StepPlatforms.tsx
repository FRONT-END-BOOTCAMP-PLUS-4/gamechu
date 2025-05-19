// components/Register/StepPlatforms.tsx
"use client";

import { useState } from "react";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";

interface Props {
    onSubmit: () => void;
    onBack: () => void;
}

const PLATFORMS = ["PC", "콘솔", "모바일", "클라우드", "VR/AR", "아케이드"];

export default function StepPlatforms({ onSubmit, onBack }: Props) {
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [error, setError] = useState("");

    const togglePlatform = (platform: string) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSubmit = () => {
        if (selectedPlatforms.length === 0) {
            setError("이용하는 플랫폼을 하나 이상 선택해주세요.");
            return;
        }
        setError("");
        onSubmit();
    };

    return (
        <div>
            <h2 className="text-body text-font-100 font-semibold mb-2">
                이용하는 게임 플랫폼을 선택해주세요
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {PLATFORMS.map((platform) => (
                    <SelectionCard
                        key={platform}
                        label={platform}
                        selected={selectedPlatforms.includes(platform)}
                        onClick={() => togglePlatform(platform)}
                    />
                ))}
            </div>

            {error && (
                <p className="text-caption text-state-error mb-4">{error}</p>
            )}

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
