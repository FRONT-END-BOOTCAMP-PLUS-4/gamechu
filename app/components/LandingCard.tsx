"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "./Button";

interface LandingCardProps {
    href: string;
    iconSrc: string;
    iconAlt: string;
    title: string;
    description: string;
    animationDelay?: string;
    buttonLabel?: string;
}

export default function LandingCard({
    href,
    iconSrc,
    iconAlt,
    title,
    description,
    animationDelay = "0s",
    buttonLabel = "시작하기",
}: LandingCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(href);
    };

    return (
        <div
            className="bg-background-300 hover:bg-primary-purple-100/10 p-8 rounded-xl text-center 
             transition-all duration-300 ease-out transform 
             hover:scale-[1.05] hover:-translate-y-1 hover:shadow-xl 
             cursor-pointer shadow-md h-[360px] flex flex-col animate-fade-in-up"
            style={{ animationDelay }}
        >
            {/* 아이콘 */}
            <div className="flex justify-center mb-6">
                <Image src={iconSrc} alt={iconAlt} width={64} height={64} />
            </div>

            {/* 텍스트 그룹 */}
            <div className="flex flex-col items-center flex-1 justify-start">
                <h2 className="text-h2 font-semibold mb-2">{title}</h2>
                <p className="text-body text-font-200 max-w-[240px] leading-relaxed text-center mb-4">
                    {description}
                </p>
            </div>

            {/* 버튼 */}
            <div className="mt-auto pt-4">
                <Button
                    label={buttonLabel}
                    size="medium"
                    type="purple"
                    onClick={handleClick}
                />
            </div>
        </div>
    );
}
