"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "./Button";

interface LandingCardProps {
    href: string;
    iconSrc: string;
    iconAlt: string;
    title: string;
    description: string;
    backgroundSrc?: string;
    animationDelay?: string;
    animationClassName: string;
    buttonLabel?: string;
}

export default function LandingCard({
    href,
    iconSrc,
    iconAlt,
    title,
    description,
    backgroundSrc,
    animationDelay = "0s",
    animationClassName = "",
    buttonLabel = "시작하기",
}: LandingCardProps) {
    return (
        <Link
            href={href}
            className={`${animationClassName ?? ""} group flex w-full transform cursor-pointer flex-col justify-between rounded-2xl bg-background-300 px-16 py-10 text-center shadow-md transition-all duration-300 ease-out lg:flex-1 lg:p-24`}
            style={{ animationDelay }}
        >
            {/*배경 이미지*/}
            {backgroundSrc && (
                <Image
                    src={backgroundSrc}
                    alt="배경 이미지"
                    fill
                    className="absolute inset-0 z-0 rounded-2xl object-cover opacity-20 transition-opacity duration-300 ease-out group-hover:opacity-50 group-hover:ring-2 group-hover:ring-primary-purple-300"
                />
            )}
            <div className="relative z-10 flex h-full flex-col">
                {/* 아이콘 */}
                <div className="mb-6 flex justify-center">
                    <Image src={iconSrc} alt={iconAlt} width={64} height={64} />
                </div>

                {/* 텍스트 그룹 */}
                <div className="flex flex-1 flex-col items-center justify-start">
                    <h2 className="mb-2 text-xl font-bold lg:text-2xl">
                        {title}
                    </h2>
                    <p className="mb-4 max-w-xs text-sm leading-relaxed text-font-200 lg:text-lg">
                        {description}
                    </p>
                </div>

                {/* 버튼 */}
                <div className="pt-4">
                    <Button label={buttonLabel} size="medium" type="purple" />
                </div>
            </div>
        </Link>
    );
}
