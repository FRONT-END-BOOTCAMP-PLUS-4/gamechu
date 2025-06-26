"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface GameCardProps {
    id: number;
    platform: string;
    title: string;
    expertRating: number;
    developer: string;
    thumbnail: string;
    reviewCount: number;
}

export default function GameCard({
    id,
    platform,
    title,
    expertRating,
    developer,
    thumbnail,
    reviewCount,
}: GameCardProps) {
    const router = useRouter();
    const handleClick = () => {
        router.push(`/games/${id}`);
    };
    const thumbnailSrc =
        !thumbnail || !thumbnail.trim()
            ? "/icons/default-thumbnail.svg"
            : thumbnail.startsWith("http")
              ? thumbnail
              : thumbnail.startsWith("//")
                ? `https:${thumbnail}`
                : thumbnail;
    return (
        <div
            onClick={handleClick}
            className="cursor-pointer box-border w-[348px] h-[348px] overflow-hidden flex flex-col rounded-[6px] border border-[1px] border-line-200 border-opacity-50 hover:border-[2px] hover:border-primary-purple-200 transition-all duration-100"
        >
            {/* 이미지 영역 */}
            <div className="relative w-full h-[248px]">
                <Image src={thumbnailSrc} alt={title} fill sizes="346px" />

                {/* 플랫폼 태그 */}
                <div className="absolute top-2 right-2 p-1 opacity-90  bg-background-100 text-caption text-font-100 rounded-[4px] border border-background-300">
                    {platform}
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="w-full h-[100px] bg-background-100 px-4 py-2 flex flex-col justify-between relative">
                {/* 제목 */}

                <h2 className="text-h3 font-semibold text-font-100 line-clamp-2">
                    {title}
                </h2>

                <div className="flex justify-between items-center mt-auto">
                    {/* 개발자 */}
                    <span className="text-caption text-font-200 line-clamp-1">
                        {developer}
                    </span>

                    {/* 별점 */}
                    <div className="flex items-center  h-[25px]">
                        <Image
                            src="/icons/review.svg"
                            alt="star"
                            width={16}
                            height={16}
                        />
                        <span className=" text-regular ml-1 mr-2">
                            {reviewCount}
                        </span>
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt="star"
                            width={16}
                            height={16}
                        />
                        <span className="text-regular text-font-100 ml-1">
                            {(expertRating ?? 0).toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
