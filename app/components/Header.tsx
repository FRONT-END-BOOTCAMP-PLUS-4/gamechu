"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Button from "./Button";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 테스트용 상태

  return (
    <header className="w-full h-[100px] bg-[#191919] flex items-center justify-between font-sans">
      {/* 왼쪽: 로고 + 메뉴 */}
      <div className="flex items-center">
        <Link href="/" className="flex-shrink-0">
          <Image src="/icons/logo.svg" alt="GAMECHU 로고" width={100} height={100} priority />
        </Link>

        <nav className="flex space-x-10 ml-[75px]">
          <Link
            href="/games"
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
            {/* 알림 아이콘 */}
            <button className="text-primary-purple-100 hover:opacity-80">
              <Image src="/icons/bell.svg" alt="알림" width={24} height={24} />
            </button>

            {/* 마이페이지 버튼 */}
            <Link href="/mypage">
              <Button label="마이 페이지" size="medium" type="black" />
            </Link>

            {/* 로그아웃 버튼 */}
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
            onClick={() => setIsLoggedIn(true)}
          />
        )}
      </div>
    </header>
  );
}
