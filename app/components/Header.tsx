"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 로그인 여부 상태

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

      {/* 오른쪽: 로그인 여부에 따라 UI 전환 */}
      <div className="flex items-center space-x-4 mr-[75px]">
        {isLoggedIn ? (
          <>
            {/* 알림 아이콘 */}
            <button className="text-primary-purple-100 hover:opacity-80">
              <Image src="/icons/bell.svg" alt="알림" width={24} height={24} />
            </button>

            {/* 마이 페이지 버튼 */}
            <Link
              href="/mypage"
              className="border border-white bg-[#191919] text-white text-[14px] leading-[20px] font-medium px-6 py-2 rounded-lg hover:opacity-80 transition h-[40px] flex items-center justify-center"
            >
              마이 페이지
            </Link>

            {/* 로그아웃 버튼 */}
            <button
                onClick={() => setIsLoggedIn(false)}
                className="bg-primary-purple-100 hover:bg-primary-purple-300 text-white text-[14px] leading-[20px] font-medium h-[40px] w-[120px] rounded-lg transition flex items-center justify-center"
            >
                로그아웃
            </button>

          </>
        ) : (
          <button
                onClick={() => setIsLoggedIn(true)}
                className="bg-primary-purple-100 hover:bg-primary-purple-300 text-white text-[14px] leading-[20px] font-medium h-[40px] w-[120px] rounded-lg transition flex items-center justify-center"
            >
                로그인
            </button>
        )}
      </div>
    </header>
  );
}
