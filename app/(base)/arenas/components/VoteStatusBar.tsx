type VoteStatusBarProps = {
    leftPercent: number;
};

export default function VoteStatusBar(props: VoteStatusBarProps) {
    return (
        <div className="w-full mt-4 h-3 rounded-lg overflow-hidden flex">
            <div
                className="rounded-l-lg"
                style={{
                    width: `${props.leftPercent}%`,
                    background: "linear-gradient(90deg, #7c3aed, #c4b5fd)",
                    transition: "width 0.5s ease",
                }}
            />
            <div
                className="rounded-r-lg"
                style={{
                    width: `${100 - props.leftPercent}%`,
                    background: "linear-gradient(90deg, #93c5fd, #2563eb)",
                    transition: "width 0.5s ease",
                }}
            />
        </div>
    );
}
