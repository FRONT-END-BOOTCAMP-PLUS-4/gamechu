"use client";
import Image from "next/image";
import CardLink from "@/app/components/CardLink";

type GameCardProps = {
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
    const thumbnailSrc =
        !thumbnail || !thumbnail.trim()
            ? "/icons/default-thumbnail.svg"
            : thumbnail.startsWith("//")
              ? `https:${thumbnail}`
              : thumbnail;

    return (
        <CardLink
            href={`/games/${id}`}
            aria-label={`${title} 게임 상세보기`}
            className="relative flex w-full flex-col overflow-hidden rounded-xl bg-background-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-background-200"
        >
            {/* 이미지 영역 */}
            <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                    src={thumbnailSrc}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                />

                {/* 플랫폼 태그 */}
                <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    {platform}
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="flex flex-col gap-2 p-3 sm:p-4">
                <h2 className="line-clamp-1 text-sm font-bold text-font-100 transition-colors group-hover:text-primary-purple-200 sm:text-base">
                    {title}
                </h2>

                <div className="flex items-center justify-between">
                    <span className="line-clamp-1 text-[11px] text-font-300 sm:text-xs">
                        {developer}
                    </span>
                </div>

                {/* 별점 */}
                <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-2">
                    <div className="flex items-center gap-1" aria-label={`리뷰 ${reviewCount}개`}>
                        <Image
                            src="/icons/review.svg"
                            alt=""
                            width={14}
                            height={14}
                            className="opacity-70"
                        />
                        <span className="text-[11px] text-font-200">
                            {reviewCount}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 rounded-lg bg-primary-purple-300/10 px-2 py-0.5" aria-label={`전문가 평점 ${expertRating}`}>
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt=""
                            width={12}
                            height={12}
                        />
                        <span className="text-[12px] font-bold text-primary-purple-100">
                            {(expertRating ?? 0).toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
        </CardLink>
    );
}
