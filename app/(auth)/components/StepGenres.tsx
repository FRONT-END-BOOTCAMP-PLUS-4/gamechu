"use client";

import { useEffect, useState } from "react";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";
import { Genre } from "@/prisma/generated";

interface Props {
    onNext: () => void;
    onBack: () => void;
}

// interface Genre {
//     id: number;
//     name: string;
// }

export default function StepGenres({ onNext, onBack }: Props) {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

    // ✅ 장르 목록 불러오기
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await fetch("/api/genres");
                const data: Genre[] = await res.json();
                setGenres(data);
            } catch (e) {
                console.error("장르 불러오기 실패", e);
            }
        };

        fetchGenres();
    }, []);

    const toggleGenre = (genreId: number) => {
        setSelectedGenreIds((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        );
    };

    const handleNext = async () => {
        // 선택 안 했으면 그냥 다음
        if (selectedGenreIds.length === 0) {
            onNext();
            return;
        }

        try {
            const res = await fetch("/api/preferred-genres", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    genreIds: selectedGenreIds, // ✅ memberId 제거
                }),
            });

            if (res.ok) {
                onNext();
            } else {
                alert("선호 장르 저장에 실패했습니다.");
            }
        } catch (err) {
            console.error("API 호출 오류:", err);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <h2 className="text-body text-font-100 font-semibold mb-2">
                선호하는 게임 장르를 선택해주세요
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {genres.map((genre) => (
                    <SelectionCard
                        key={genre.id}
                        label={genre.name}
                        selected={selectedGenreIds.includes(genre.id)}
                        onClick={() => toggleGenre(genre.id)}
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
