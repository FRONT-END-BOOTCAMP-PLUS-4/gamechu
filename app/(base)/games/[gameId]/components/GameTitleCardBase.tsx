import Image from "next/image";
import WishlistButtonClient from "./WishlistButtonClient";

interface Props {
    image: string;
    title: string;
    developer: string | null;
    rating?: number | null;
    releaseDate: string | null;
    gameId: number;
    viewerId: string;
}

export default function GameTitleCardBase({
    image,
    title,
    developer,
    rating,
    releaseDate,
    gameId,
    viewerId,
}: Props) {
    return (
        <div className="flex w-full max-w-[960px] flex-col overflow-visible rounded-3xl bg-background-100 shadow lg:h-[330px] lg:min-w-[800px] lg:flex-row">
            {/* 이미지 영역 */}
            <div className="relative aspect-[16/9] w-full flex-none lg:h-[330px] lg:w-[480px]">
                <Image
                    src={image.startsWith("//") ? `https:${image}` : image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="rounded-t-3xl object-cover lg:rounded-l-3xl lg:rounded-t-none"
                />
            </div>

            {/* 정보 영역 */}
            <div className="flex flex-1 flex-col p-6 lg:p-10">
                <div className="mb-4 mt-2 lg:mb-6 lg:mt-4">
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

                <div className="mt-2 lg:mt-auto">
                    <WishlistButtonClient
                        gameId={gameId}
                        viewerId={viewerId || ""}
                    />
                </div>
            </div>
        </div>
    );
}
