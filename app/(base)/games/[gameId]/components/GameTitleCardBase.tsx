import Image from "next/image";
import WishlistButtonClient from "./WishlistButtonClient";

interface Props {
    image: string;
    title: string;
    developer: string;
    rating?: number;
    releaseDate: string;
    gameId: number;
    viewerId?: string;
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
        <div className="flex w-full max-w-[960px] h-[330px] overflow-hidden">
            <div className="flex-none relative w-[480px] h-[330px]">
                <Image
                    src={image.startsWith("//") ? `https:${image}` : image}
                    alt={title}
                    fill
                    className="object-fill"
                />
            </div>

            <div className="flex-1 flex-col p-10">
                <div className="mb-6 mt-4">
                    <h2 className="text-h2 font-semibold text-font-100 line-clamp-2">
                        {title}
                    </h2>
                    <p className="text-caption text-font-200">{developer}</p>
                </div>

                <div className="flex justify-left gap-6 mb-6">
                    <div className="flex gap-3 items-start">
                        <Image
                            src="/icons/yellow-star.svg"
                            alt="rating"
                            width={36}
                            height={36}
                        />
                        <div className="flex flex-col">
                            {typeof rating === "number" ? (
                                <span className="text-regular font-semibold text-font-100">
                                    {rating.toFixed(1)} / 5.0
                                </span>
                            ) : (
                                <span className="text-regular text-font-200">
                                    평점 없음
                                </span>
                            )}
                            <span className="text-caption text-font-200">
                                겜잘알 평점
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        <Image
                            src="/icons/release-date.svg"
                            alt="release date"
                            width={36}
                            height={36}
                        />
                        <div className="flex flex-col">
                            <span className="text-regular font-semibold text-font-100">
                                {releaseDate}
                            </span>
                            <span className="text-caption text-font-200">
                                출시일
                            </span>
                        </div>
                    </div>
                </div>

                {viewerId && (
                    <WishlistButtonClient gameId={gameId} viewerId={viewerId} />
                )}
            </div>
        </div>
    );
}
