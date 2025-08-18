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
            className="box-border flex w-full cursor-pointer flex-col overflow-hidden rounded-[6px] border border-[1px] border-line-200 border-opacity-50 bg-background-100 transition-all duration-100 hover:border-[2px] hover:border-primary-purple-200"
            // className="cursor-pointer box-border w-[348px] h-[348px] overflow-hidden flex flex-col rounded-[6px] border border-[1px] border-line-200 border-opacity-50 hover:border-[2px] hover:border-primary-purple-200 transition-all duration-100"
        >
            {/* 이미지 영역: 모바일 16:9 → 데스크탑 1:1 */}
            {/* <div className="relative w-full h-[248px]">
                <Image src={thumbnailSrc} alt={title} fill sizes="346px" /> */}
            <div className="relative aspect-[16/9] w-full min-[1024px]:aspect-square">
                <Image
                    src={thumbnailSrc}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(min-width:1024px) 33vw, (min-width:820px) 50vw, 100vw"
                    priority={false}
                />

                {/* 플랫폼 태그 */}
                <div className="absolute right-2 top-2 rounded-[4px] border border-background-300 bg-background-100 p-1 text-caption text-font-100 opacity-90">
                    {platform}
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="relative flex w-full flex-col justify-between gap-2 px-4 py-3">
                {/* 제목 */}

                <h2 className="line-clamp-2 text-h3 font-semibold text-font-100">
                    {title}
                </h2>

                <div className="mt-auto flex items-center justify-between">
                    {/* 개발자 */}
                    <span className="line-clamp-1 text-caption text-font-200">
                        {developer}
                    </span>

                    {/* 별점 */}
                    <div className="flex h-[25px] items-center">
                        <Image
                            src="/icons/review.svg"
                            alt="star"
                            width={16}
                            height={16}
                        />
                        <span className="text-regular ml-1 mr-2">
                            {reviewCount}
                        </span>
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt="star"
                            width={16}
                            height={16}
                        />
                        <span className="text-regular ml-1 text-font-100">
                            {(expertRating ?? 0).toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
