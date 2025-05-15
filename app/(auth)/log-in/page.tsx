'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 간단한 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('이메일 형식이 잘못되었습니다.');
      return;
    }
    setEmailError('');
    // 로그인 로직
    console.log('로그인 요청:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-400 font-sans">
      <div className="bg-background-300 p-10 rounded-xl w-full max-w-[400px] shadow-lg">
        <div className="flex justify-center mb-8">
          <Image
            src="/icons/logo.svg" // 너가 등록한 전체 로고
            alt="GAMECHU 로고"
            width={160}
            height={160}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 이메일 */}
          <div>
            <label className="block text-font-100 font-semibold mb-2 text-body">이메일</label>
            <Input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hasError={!!emailError}
            />
            {emailError && (
              <p className="text-caption text-state-error mt-1">{emailError}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-font-100 font-semibold mb-2 text-body">비밀번호</label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 로그인 버튼 */}
          <div className="flex justify-center">
            <Button label="로그인" size="large" type="purple" htmlType="submit" />
          </div>

          {/* 회원가입 링크 */}
          <p className="text-center text-caption text-font-200 mt-2">
            회원이 아니신가요?{' '}
            <Link href="sign-up" className="text-primary-purple-100 font-semibold hover:underline">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
