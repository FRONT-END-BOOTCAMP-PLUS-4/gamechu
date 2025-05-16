'use client';

import { useState } from 'react';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';

interface Props {
  onNext: () => void;
}

export default function StepProfile({ onNext }: Props) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailDuplicate, setIsEmailDuplicate] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailError, setEmailError] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | null>(null);
  const [birth, setBirth] = useState('');
  const [error, setError] = useState('');

  const validateEmailFormat = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidDate = (dateString: string): boolean => {
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10);
    const day = parseInt(dateString.substring(6, 8), 10);

    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

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
    if (!nickname || !email || !password || !confirm || !gender || !birth) {
      setError('모든 필드를 입력해주세요.');
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

    const birthRegex = /^\d{8}$/;
    if (!birthRegex.test(birth) || !isValidDate(birth)) {
      alert('유효한 생년월일을 입력해주세요.');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
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

      <div>
        <label className="block mb-1 text-body text-font-100 font-semibold">성별</label>
        <div className="flex justify-center gap-4 mb-6">
          <Button label="M" size="large" type="blue" onClick={() => setGender('M')} />
          <Button label="F" size="large" type="purple" onClick={() => setGender('F')} />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-body text-font-100 font-semibold">생년월일</label>
        <Input
          placeholder="ex) 19900101"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />
      </div>

      {error && <p className="text-caption text-state-error mb-4">{error}</p>}

      <div className="mt-8 text-right">
        <Button label="다음 →" onClick={handleNext} />
      </div>
    </div>
  );
}

//API 예제: 실제로는 API 폴더 에서 작업할 예정정
const fakeCheckEmailAPI = async (email: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(email.toLowerCase() === 'test@example.com');
    }, 500);
  });
};
