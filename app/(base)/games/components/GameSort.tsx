"use client";

import Button from "@/app/components/Button";

interface SortOption {
    label: string;
    value: "latest" | "popular" | "rating";
}

interface Props {
    current: "latest" | "popular" | "rating";
    onChange: (value: "latest" | "popular" | "rating") => void;
}

const options: SortOption[] = [
    { label: "리뷰순", value: "popular" },
    { label: "최신순", value: "latest" },
    { label: "별점순", value: "rating" },
];

export default function GameSort({ current, onChange }: Props) {
    return (
        <div className="flex gap-[15px]">
            {options.map((option) => (
                <Button
                    key={option.value}
                    label={option.label}
                    size="small"
                    type={current === option.value ? "purple" : "black"}
                    onClick={() => onChange(option.value)}
                />
            ))}
        </div>
    );
}
