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
            className={`
                min-w-[140px] h-[80px]   // ✅ min-width로 변경해 반응형 대응
                border rounded-xl 
                flex items-center justify-center text-center
                px-2 py-2 text-sm font-medium leading-snug
                break-words whitespace-pre-wrap
                transition-all duration-150
                ${selected
                    ? "bg-primary-purple-100 text-white border-primary-purple-100"
                    : "bg-background-100 text-font-100 border-font-200 hover:bg-background-200"}
            `}
        >
            <span className="block w-full">{label}</span>
        </button>
    );
}