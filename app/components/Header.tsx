"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Cookies from "js-cookie";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import useModalStore from "@/stores/modalStore";
import Button from "./Button";
import { Menu, User } from "lucide-react";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const id = await getAuthUserId();
            setIsLoggedIn(!!id);
        };
        fetchUser();
    }, []);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handleLogout = async () => {
        Cookies.remove("attendance", { path: "/" });
        await signOut({ redirect: false });
        setIsLoggedIn(false);
        setMenuOpen(false);
        router.refresh();
    };

    const handleLogin = () => {
        router.push(`/log-in?callbackUrl=${encodeURIComponent(pathname)}`);
        setMenuOpen(false);
    };

    const MenuLink = ({ href, label }: { href: string; label: string }) => (
        <Link
            href={href}
            onClick={() => setMenuOpen(false)}
            className={`text-base md:text-2xl font-medium hover:text-primary-purple-100 ${
                pathname === href ? "text-primary-purple-100" : "text-white"
            }`}
        >
            {label}
        </Link>
    );

    return (
        <header className="bg-background-300 text-white shadow-md mb-6 md:mb-0">
            <div className="max-w-screen-xl relative mx-auto px-4 py-6 flex items-center justify-between">
                {/* 로고 */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/icons/gamechu-logo.svg"
                        alt="Gamechu 로고"
                        width={150}
                        height={150}
                        priority
                    />
                </Link>

                {/* 모바일 메뉴 버튼 */}
                <button
                    className="md:hidden"
                    onClick={toggleMenu}
                    aria-label="메뉴 열기"
                >
                    <Menu width={28} height={28} />
                </button>

                {/* 가운데 메뉴 (게임, 투기장) */}
                <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-16 text-2xl">
                    <MenuLink href="/games" label="게임" />
                    <MenuLink href="/arenas" label="투기장" />
                </nav>

                {/* 오른쪽 메뉴 (알림, 마이페이지, 로그인/로그아웃) */}
                <div className="hidden md:flex items-center space-x-8">
                    {isLoggedIn && (
                        <button
                            onClick={() => {
                                useModalStore
                                    .getState()
                                    .openModal("notification", null);
                                setMenuOpen(false);
                            }}
                        >
                            <Image
                                src="/icons/bell.svg"
                                alt="알림"
                                width={24}
                                height={24}
                            />
                        </button>
                    )}
                    {isLoggedIn ? (
                        <>
                            <Link href="/profile">
                                <User size={28} color="#9333EA" />
                            </Link>
                            <Button
                                label="로그아웃"
                                size="small"
                                type="purple"
                                onClick={handleLogout}
                            />
                        </>
                    ) : (
                        <Button
                            label="로그인"
                            size="small"
                            type="purple"
                            onClick={handleLogin}
                        />
                    )}
                </div>
            </div>

            {/* 모바일 드롭다운 메뉴 */}
            {menuOpen && (
                <div className="md:hidden px-4 pb-4 flex flex-col space-y-4 bg-background-300 border-t border-white/10">
                    <MenuLink href="/games" label="게임" />
                    <MenuLink href="/arenas" label="투기장" />
                    {isLoggedIn && (
                        <button
                            className="text-white text-base text-left"
                            onClick={() => {
                                useModalStore
                                    .getState()
                                    .openModal("notification", null);
                                setMenuOpen(false);
                            }}
                        >
                            알림
                        </button>
                    )}
                    {isLoggedIn ? (
                        <>
                            <MenuLink href="/profile" label="마이페이지" />
                            <Button
                                label="로그아웃"
                                size="small"
                                type="purple"
                                onClick={handleLogout}
                            />
                        </>
                    ) : (
                        <Button
                            label="로그인"
                            size="small"
                            type="purple"
                            onClick={handleLogin}
                        />
                    )}
                </div>
            )}
        </header>
    );
}
