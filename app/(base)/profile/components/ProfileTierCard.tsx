//티어 컴포넌트
"use client";

// components/profile/ProfileTierCard.tsx
export default function ProfileTierCard() {
    const tiers = [
        { label: "브론즈", range: "0 - 999" },
        { label: "실버", range: "1,000 - 1,999" },
        { label: "골드", range: "2,000 - 2,999", active: true },
        { label: "플래티넘", range: "3,000 - 3,999" },
        { label: "다이아몬드", range: "4,000+" },
    ];

    return (
        <div className="flex-1 bg-background-300 p-6 rounded-xl shadow">
            <h2 className="font-semibold text-body mb-4">나의 티어</h2>
            <p className="text-sm mb-2 text-font-200">포인트를 모아 다음 티어로 승급하세요!</p>
            <div className="text-right text-caption text-font-200 mb-1">다음 티어까지: 100 포인트</div>
            <div className="h-4 w-full bg-background-200 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-primary-purple-200 w-[80%]" />
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-caption">
                {tiers.map((tier) => (
                    <div
                        key={tier.label}
                        className={`rounded-xl p-4 border ${
                            tier.active
                                ? "bg-primary-purple-200 border-primary-purple-200 text-white"
                                : "border-line-200 bg-background-200"
                        }`}
                    >
                        <div className="font-medium mb-1">{tier.label}</div>
                        <div className="text-xs">{tier.range}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}