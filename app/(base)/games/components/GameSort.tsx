"use client";

// import Button from "@/app/components/Button";

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
    const selectedOption =
        "bg-primary-purple-200 text-font-100 hover:bg-primary-purple-300";
    const unselectedOption =
        "bg-background-400 text-font-100 border border-line-100 hover:border-primary-purple-200";

    return (
        <div className="flex w-full gap-2 sm:w-auto sm:gap-4">
            {options.map((option) => (
                // TODO: Button component에 반응형 적용
                <button
                    key={option.value}
                    className={`inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-button text-sm font-medium transition duration-200 sm:flex-none sm:px-4 sm:py-2 ${
                        current === option.value
                            ? selectedOption
                            : unselectedOption
                    }`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
                // <Button
                //     key={option.value}
                //     label={option.label}
                //     size="small"
                //     type={current === option.value ? "purple" : "black"}
                //     onClick={() => onChange(option.value)}
                // />
            ))}
        </div>
    );
}
