"use client";

type VoteStatusBarProps = {
    voteCount?: number;
    leftPercent: number;
    rightPercent: number;
};

export default function VoteStatusBar(props: VoteStatusBarProps) {
    return (
        <div className="relative mt-4 flex h-3 w-full overflow-hidden rounded-lg">
            {props.voteCount === 0 ? (
                <>
                    <div
                        className="h-full w-full rounded-lg"
                        style={{
                            background:
                                "linear-gradient(90deg, #d4d4d4, #a3a3a3)",
                            opacity: 0.4,
                            transition: "background 0.5s ease",
                        }}
                    />
                </>
            ) : (
                <>
                    <div
                        className="rounded-l-lg"
                        style={{
                            width: `${props.leftPercent}%`,
                            background:
                                "linear-gradient(90deg, #7c3aed, #c4b5fd)",
                            transition: "width 0.5s ease",
                        }}
                    />
                    <div
                        className="rounded-r-lg"
                        style={{
                            width: `${props.rightPercent}%`,
                            background:
                                "linear-gradient(90deg, #93c5fd, #2563eb)",
                            transition: "width 0.5s ease",
                        }}
                    />
                </>
            )}
        </div>
    );
}
