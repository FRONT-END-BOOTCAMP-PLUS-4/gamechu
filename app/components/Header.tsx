'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 테스트용
  const router = useRouter();

  return (
    <header className="w-full h-[100px] bg-[#191919] flex items-center justify-between font-sans">
      {/* 왼쪽: 로고 + 메뉴 */}
      <div className="flex items-center">
        <Link href="/" className="flex-shrink-0">
          <Image src="/icons/logo.svg" alt="GAMECHU 로고" width={100} height={100} priority />
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

      {/* 오른쪽: 상태에 따른 버튼 */}
      <div className="flex items-center space-x-4 mr-[75px]">
        {isLoggedIn ? (
          <>
            <button className="text-primary-purple-100 hover:opacity-80">
              <Image src="/icons/bell.svg" alt="알림" width={24} height={24} />
            </button>

            <Link href="/profile">
              <Button label="마이 페이지" size="medium" type="black" />
            </Link>

            <Button
              label="로그아웃"
              size="medium"
              type="purple"
              onClick={() => setIsLoggedIn(false)}
            />
          </>
        ) : (
          <Button
            label="로그인"
            size="medium"
            type="purple"
            onClick={() => router.push("/log-in")}
          />
        )}
      </div>
    </header>
  );
}
