import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface GameCardProps {
    id: number;
    platform: string;
    title: string;
    rating: number;
    developer: string;
    thumbnail: string;
}

export default function GameCard({
    id,
    platform,
    title,
    rating,
    developer,
    thumbnail,
}: GameCardProps) {
    const router = useRouter();
    const handleClick = () => {
        router.push(`/game/${id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="w-[330px] h-[330px] flex flex-col rounded-[8px] overflow-hidden transition-all duration-100 hover:border-2 hover:border-primary-purple-200 border-transparent"
        >
            {/* 이미지 영역 */}
            <div
                className="relative w-full h-[230px]"
                style={{
                    backgroundImage: `url(${thumbnail})`,
                    backgroundSize: "100% 100%", // ✅ 이거!
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* 플랫폼 태그 */}
                <div className="absolute top-4 right-4 px-3 py-[2px] bg-background-100 text-caption text-font-100 rounded-[4px] border border-background-300">
                    {platform}
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="w-full h-[100px] bg-background-100 px-4 py-3 flex flex-col justify-between">
                {/* 제목 + 별점 */}
                <div className="flex justify-between items-start">
                    <h2 className="text-h2 font-semibold text-font-100 line-clamp-1">
                        {title}
                    </h2>
                    <div className="flex items-center w-[50px] h-[25px]">
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt="star"
                            width={16}
                            height={16}
                            className="mr-1"
                        />
                        <span className="text-regular text-font-100">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* 개발자 */}
                <span className="text-caption text-font-200 line-clamp-1">
                    {developer}
                </span>
            </div>
        </div>
    );
}
