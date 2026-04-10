type SelectionCardProps = {
    label: string;
    selected: boolean;
    onClick: () => void;
};

export default function SelectionCard({
    label,
    selected,
    onClick,
}: SelectionCardProps) {
    return (
        <button
            onClick={onClick}
            className={`// ✅ min-width로 변경해 반응형 대응 flex h-[80px] min-w-[140px] items-center justify-center whitespace-pre-wrap break-words rounded-xl border px-2 py-2 text-center text-sm font-medium leading-snug transition-all duration-150 ${
                selected
                    ? "border-primary-purple-100 bg-primary-purple-100 text-white"
                    : "border-font-200 bg-background-100 text-font-100 hover:bg-background-200"
            } `}
        >
            <span className="block w-full">{label}</span>
        </button>
    );
}
