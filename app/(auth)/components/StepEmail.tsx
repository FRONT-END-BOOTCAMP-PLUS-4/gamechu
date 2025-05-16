'use client';

import { useState } from 'react';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';

interface Props {
  onNext: () => void;
}

export default function StepEmail({ onNext }: Props) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailDuplicate, setIsEmailDuplicate] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmailFormat = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkEmailDuplicate = async () => {
    if (!validateEmailFormat(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      setIsEmailDuplicate(null);
      return;
    }

    const isDuplicate = await fakeCheckEmailAPI(email);
    setIsEmailDuplicate(isDuplicate);
    setEmailError('');
  };

  const handleNext = () => {
    if (!nickname || !email || !password || !confirm) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (!validateEmailFormat(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (isEmailDuplicate === null) {
      alert('이메일 중복 검사를 진행해주세요.');
      return;
    }

    if (isEmailDuplicate === true) {
      alert('이미 사용 중인 이메일입니다.');
      return;
    }

    if (password !== confirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    onNext();
  };

  return (
    <div>
      <h2 className="text-h2 font-bold mb-6">회원 정보를 입력해주세요</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-body text-font-100 font-semibold">닉네임</label>
          <Input
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-body text-font-100 font-semibold">이메일</label>
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailDuplicate(null);
                }}
                hasError={!!emailError || isEmailDuplicate === true}
              />
            </div>
            <Button
              label="중복 검사"
              size="small"
              type="black"
              onClick={checkEmailDuplicate}
            />
          </div>
        </div>

        {emailError && <p className="text-caption text-state-error">{emailError}</p>}
        {isEmailDuplicate === true && (
          <p className="text-caption text-state-error">이미 사용 중인 이메일입니다.</p>
        )}
        {isEmailDuplicate === false && (
          <p className="text-caption text-green-400">사용 가능한 이메일입니다.</p>
        )}

        <div>
          <label className="block mb-1 text-body text-font-100 font-semibold">비밀번호</label>
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-body text-font-100 font-semibold">비밀번호 확인</label>
          <Input
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 text-right">
        <Button label="다음 →" onClick={handleNext} />
      </div>
    </div>
  );
}

const fakeCheckEmailAPI = async (email: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(email.toLowerCase() === 'test@example.com');
    }, 500);
  });
};