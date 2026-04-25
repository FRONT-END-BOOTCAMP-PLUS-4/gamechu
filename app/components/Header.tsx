"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Cookies from "js-cookie";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import Button from "./Button";
import NotificationBellButton from "./NotificationBellButton";
import { Menu, User, X } from "lucide-react";

type MenuLinkProps = {
    href: string;
    label: string;
    pathname: string;
    onNavigate: () => void;
};

function MenuLink({ href, label, pathname, onNavigate }: MenuLinkProps) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`rounded-lg px-16 py-2 text-center text-base font-medium transition-all duration-200 hover:bg-white/10 sm:px-4 sm:py-2 sm:text-2xl ${
                pathname === href ? "text-primary-purple-100" : "text-white"
            }`}
        >
            {label}
        </Link>
    );
}

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
    const handleNavigate = useCallback(() => setMenuOpen(false), []);

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

    return (
        <header className="relative border-b border-white/10 bg-background-300 text-white shadow-lg">
            <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
                {/* 로고 */}
                <Link
                    href="/"
                    className="flex items-center transition-all duration-200 hover:scale-105"
                >
                    <Image
                        src="/icons/gamechu-logo.svg"
                        alt="Gamechu 로고"
                        width={160}
                        height={100}
                        priority
                    />
                </Link>

                {/* 모바일 햄버거 버튼 */}
                <button
                    className="rounded-lg bg-white/10 p-1 transition-all sm:hidden"
                    onClick={toggleMenu}
                    aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* 가운데  */}
                <nav className="hidden whitespace-nowrap sm:flex sm:space-x-8">
                    <MenuLink
                        href="/games"
                        label="게임"
                        pathname={pathname}
                        onNavigate={handleNavigate}
                    />
                    <MenuLink
                        href="/arenas"
                        label="투기장"
                        pathname={pathname}
                        onNavigate={handleNavigate}
                    />
                </nav>

                {/* 오른쪽  */}
                <div className="hidden flex-shrink-0 items-center space-x-8 sm:flex">
                    {isLoggedIn && (
                        <NotificationBellButton
                            onOpen={() => setMenuOpen(false)}
                        />
                    )}
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/profile"
                                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                                aria-label="마이페이지"
                            >
                                <User
                                    size={28}
                                    className="text-primary-purple-100"
                                />
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
            <div
                id="mobile-menu"
                aria-hidden={!menuOpen}
                inert={!menuOpen || undefined}
                className={`absolute left-0 right-0 z-40 overflow-hidden border-b border-t border-white/10 bg-background-300 transition-all duration-300 sm:hidden ${
                    menuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="flex items-start justify-between px-6 py-4">
                    {/* 왼쪽  */}
                    <nav className="flex flex-col space-y-2">
                        <MenuLink
                            href="/games"
                            label="게임"
                            pathname={pathname}
                            onNavigate={handleNavigate}
                        />
                        <MenuLink
                            href="/arenas"
                            label="투기장"
                            pathname={pathname}
                            onNavigate={handleNavigate}
                        />
                    </nav>

                    {/* 오른쪽 */}
                    <div className="flex flex-col items-end space-y-3">
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center space-x-4">
                                    {/* 알림 버튼 */}
                                    <NotificationBellButton
                                        size={20}
                                        onOpen={() => setMenuOpen(false)}
                                    />

                                    {/* 마이페이지 버튼 */}
                                    <Link
                                        href="/profile"
                                        className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/10"
                                        onClick={() => setMenuOpen(false)}
                                        aria-label="마이페이지"
                                    >
                                        <User
                                            size={20}
                                            className="text-primary-purple-100"
                                        />
                                    </Link>
                                </div>

                                {/* 하단 로그아웃 버튼 */}
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
            </div>
        </header>
    );
}
