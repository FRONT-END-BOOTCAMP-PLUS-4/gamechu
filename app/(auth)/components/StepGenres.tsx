"use client";

import { useState } from "react";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";

interface Props {
    onNext: () => void;
    onBack: () => void;
}

const GENRES = [
    "RPG",
    "액션",
    "어드벤처",
    "슈팅",
    "퍼즐",
    "전략",
    "레이싱",
    "시뮬레이션",
    "스포츠",
    "음악",
];

export default function StepGenres({ onNext, onBack }: Props) {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [error, setError] = useState("");

    const toggleGenre = (genre: string) => {
        setSelectedGenres((prev) =>
            prev.includes(genre)
                ? prev.filter((g) => g !== genre)
                : [...prev, genre]
        );
    };

    const handleNext = () => {
        if (selectedGenres.length === 0) {
            setError("장르를 하나 이상 선택해주세요.");
            return;
        }
        setError("");
        onNext();
    };

    return (
        <div>
            <h2 className="text-body text-font-100 font-semibold mb-2">
                선호하는 게임 장르를 선택해주세요
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {GENRES.map((genre) => (
                    <SelectionCard
                        key={genre}
                        label={genre}
                        selected={selectedGenres.includes(genre)}
                        onClick={() => toggleGenre(genre)}
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
                    label="다음 →"
                    size="medium"
                    type="purple"
                    onClick={handleNext}
                />
            </div>
        </div>
    );
}
