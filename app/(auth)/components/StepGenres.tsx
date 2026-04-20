"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import { Genre } from "@/prisma/generated";

type Props = {
    onNext: () => void;
    onBack: () => void;
};

export default function StepGenres({ onNext, onBack }: Props) {
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [toast, setToast] = useState({
        show: false,
        status: "error" as const,
        message: "",
    });

    const { data: genres = [] } = useQuery<Genre[]>({
        queryKey: queryKeys.genres(),
        queryFn: () => fetcher("/api/genres"),
    });

    const { mutate: saveGenres, isPending } = useMutation({
        mutationFn: () =>
            fetch("/api/preferred-genres", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ genreIds: selectedGenreIds }),
            }).then((res) => {
                if (!res.ok) throw new Error("선호 장르 저장에 실패했습니다.");
            }),
        onSuccess: () => onNext(),
        onError: () =>
            setToast({
                show: true,
                status: "error",
                message: "선호 장르 저장에 실패했습니다.",
            }),
    });

    const toggleGenre = (genreId: number) => {
        setSelectedGenreIds((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        );
    };

    const handleNext = () => {
        saveGenres();
    };

    return (
        <div>
            <h2 className="mb-2 text-body font-semibold text-font-100">
                선호하는 게임 장르를 선택해주세요
            </h2>

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {genres.map((genre) => (
                    <SelectionCard
                        key={genre.id}
                        label={genre.name}
                        selected={selectedGenreIds.includes(genre.id)}
                        onClick={() => toggleGenre(genre.id)}
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
                    label="다음 →"
                    size="medium"
                    type="purple"
                    onClick={handleNext}
                    disabled={isPending}
                />
            </div>
        </div>
    );
}
