import Image from "next/image";
import WishlistButtonClient from "./WishlistButtonClient";

interface GameTitleInfoSectionProps {
    title: string;
    developer: string | null;
    rating?: number | null;
    releaseDate: string | null;
    gameId: number;
    viewerId: string;
}

export default function GameTitleInfoSection({
    title,
    developer,
    rating,
    releaseDate,
    gameId,
    viewerId,
}: GameTitleInfoSectionProps) {
    return (
        <div className="flex h-[350px] flex-1 flex-col whitespace-nowrap p-4 lg:p-10">
            <div className="mb-4 lg:mb-6">
                <h2 className="line-clamp-2 text-lg font-semibold text-font-100 lg:text-h2">
                    {title}
                </h2>
                <p className="text-xs text-font-200 lg:text-caption">
                    {developer}
                </p>
            </div>

            <div className="mb-4 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:gap-6">
                <div className="mb-2 flex items-start gap-2 lg:mb-0 lg:gap-3">
                    <Image
                        src="/icons/yellow-star.svg"
                        alt="rating"
                        width={28}
                        height={28}
                        className="lg:h-[36px] lg:w-[36px]"
                    />
                    <div className="flex flex-col">
                        {typeof rating === "number" ? (
                            <span className="lg:text-regular text-base font-semibold text-font-100">
                                {rating.toFixed(1)} / 5.0
                            </span>
                        ) : (
                            <span className="lg:text-regular text-base text-font-200">
                                평점 없음
                            </span>
                        )}
                        <span className="text-xs text-font-200 lg:text-caption">
                            겜잘알 평점
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-2 lg:gap-3">
                    <Image
                        src="/icons/release-date.svg"
                        alt="release date"
                        width={28}
                        height={28}
                        className="lg:h-[36px] lg:w-[36px]"
                    />
                    <div className="flex flex-col">
                        <span className="lg:text-regular text-base font-semibold text-font-100">
                            {releaseDate}
                        </span>
                        <span className="text-xs text-font-200 lg:text-caption">
                            출시일
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <WishlistButtonClient
                    gameId={gameId}
                    viewerId={viewerId || ""}
                />
            </div>
        </div>
    );
}
