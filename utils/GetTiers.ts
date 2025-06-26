// ✅ src/utils/getTier.ts
import { tiers, Tier } from "@/constants/tiers";

export function getTier(score: number): Tier {
    return tiers.find((tier) => score >= tier.min && score <= tier.max)!;
}
