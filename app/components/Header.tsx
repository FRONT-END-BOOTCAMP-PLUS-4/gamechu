"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Button from "./Button";

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const id = await getAuthUserId();
            setIsLoggedIn(id !== null);
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        setIsLoggedIn(false);
        router.refresh();
    };

    const handleGoToLogin = () => {
        router.push(`/log-in?callbackUrl=${encodeURIComponent(pathname)}`);
    };

    return (
        <header className="w-full h-[80px] bg-background-300 flex items-center justify-between font-sans">
            <div className="flex items-center pl-[40px]">
                <Link
                    href="/"
                    className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
                >
                    <Image
                        src="/icons/gamechu-logo.svg"
                        alt="GAMECHU 로고"
                        width={150}
                        height={150}
                        priority
                    />
                </Link>

                <nav className="flex space-x-10 ml-[100px]">
                    <Link
                        href="/game"
                        className={`${
                            pathname === "/game"
                                ? "text-primary-purple-100"
                                : "text-white"
                        } text-[24px] leading-[32px] font-semibold hover:opacity-80`}
                    >
                        게임
                    </Link>
                    <Link
                        href="/arena"
                        className={`${
                            pathname === "/arena"
                                ? "text-primary-purple-100"
                                : "text-white"
                        } text-[24px] leading-[32px] font-semibold hover:opacity-80`}
                    >
                        투기장
                    </Link>
                </nav>
            </div>

            <div className="flex items-center space-x-4 mr-[75px]">
                {isLoggedIn ? (
                    <>
                        <button className="text-primary-purple-100 hover:opacity-80">
                            <Image
                                src="/icons/bell.svg"
                                alt="알림"
                                width={24}
                                height={24}
                            />
                        </button>
                        <Link href="/profile">
                            <Button
                                label="마이 페이지"
                                size="medium"
                                type="black"
                            />
                        </Link>
                        <Button
                            label="로그아웃"
                            size="medium"
                            type="purple"
                            onClick={handleLogout}
                        />
                    </>
                ) : (
                    <Button
                        label="로그인"
                        size="medium"
                        type="purple"
                        onClick={handleGoToLogin}
                    />
                )}
            </div>
        </header>
    );
}
