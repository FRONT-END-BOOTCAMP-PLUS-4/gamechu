// ✅ src/constants/tiers.ts
export type Tier = {
    label: string;
    min: number;
    max: number;
    color: string;
    icon: string;
};

export const tiers: Tier[] = [
    {
        label: "브론즈",
        min: 0,
        max: 999,
        color: "#C97A40",
        icon: "/icons/bronze.svg",
    },
    {
        label: "실버",
        min: 1000,
        max: 1999,
        color: "#B0B0B0",
        icon: "/icons/silver.svg",
    },
    {
        label: "골드",
        min: 2000,
        max: 2999,
        color: "#FFD700",
        icon: "/icons/gold.svg",
    },
    {
        label: "플래티넘",
        min: 3000,
        max: 3999,
        color: "#45E0FF",
        icon: "/icons/platinum.svg",
    },
    {
        label: "다이아몬드",
        min: 4000,
        max: Infinity,
        color: "#4C7DFF",
        icon: "/icons/diamond.svg",
    },
];
