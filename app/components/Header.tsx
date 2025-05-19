"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Button from "./Button";
import { useAuthStore } from "@/stores/AuthStore";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie"; // ✅ 쿠키 삭제를 위한 js-cookie 라이브러리

export default function Header() {
    const user = useAuthStore((state) => state.user);
    const clearUser = useAuthStore((state) => state.clearUser);
    const router = useRouter();
    const pathname = usePathname(); // ✅ 현재 페이지 경로 추출

    const handleLogout = async () => {
        clearUser();                          // zustand 상태 초기화
        Cookies.remove("auth-user", { path: "/" }); // ✅ 쿠키 직접 삭제
        await signOut({ redirect: false });   // 세션 로그아웃
        router.refresh();                     // 페이지 강제 리렌더링
    };

    const handleGoToLogin = () => {
        router.push(`/log-in?callbackUrl=${encodeURIComponent(pathname)}`); // ✅ 경로 포함
    };

    return (
        <header className="w-full h-[100px] bg-[#191919] flex items-center justify-between font-sans">
            <div className="flex items-center">
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/icons/logo.svg"
                        alt="GAMECHU 로고"
                        width={100}
                        height={100}
                        priority
                    />
                </Link>

                <nav className="flex space-x-10 ml-[75px]">
                    <Link
                        href="/game"
                        className="text-white text-[24px] leading-[32px] font-semibold hover:opacity-80"
                    >
                        게임
                    </Link>
                    <Link
                        href="/arena"
                        className="text-white text-[24px] leading-[32px] font-semibold hover:opacity-80"
                    >
                        투기장
                    </Link>
                </nav>
            </div>

            <div className="flex items-center space-x-4 mr-[75px]">
                {user ? (
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
                        onClick={handleGoToLogin} // ✅ 로그인 버튼 클릭 시 현재 경로 포함 이동
                    />
                )}
            </div>
        </header>
    );
}
