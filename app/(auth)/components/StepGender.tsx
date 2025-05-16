'use client';

import { useState } from 'react';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function StepGenderBirth({ onNext, onBack }: Props) {
  const [gender, setGender] = useState<'M' | 'F' | null>(null);
  const [birth, setBirth] = useState('');
  const [error, setError] = useState('');

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

  const handleNext = () => {
    if (!gender || !birth) {
      setError('성별과 생년월일을 모두 입력해주세요.');
      return;
    }

    const birthRegex = /^\d{8}$/;
    if (!birthRegex.test(birth)) {
      setError('생년월일은 8자리 숫자 (예: 19990114) 형식으로 입력해주세요.');
      return;
    }

    if (!isValidDate(birth)) {
      setError('유효한 생년월일을 입력해주세요.');
      return;
    }

    setError('');
    onNext();
  };

  return (
    <div>
      <h2 className="text-h2 font-bold mb-6">회원 정보를 입력해주세요</h2>

      <p className="text-body text-font-100 font-semibold mb-2">성별을 선택해주세요 (최대 1개)</p>
      <div className="flex justify-center gap-4 mb-6">
        <Button
          label="M"
          size="large"
          type="blue"
          onClick={() => setGender('M')}
        />
        <Button
          label="F"
          size="large"
          type="purple"
          onClick={() => setGender('F')}
        />
      </div>

      <p className="text-body text-font-100 font-semibold mb-2">생년월일을 입력해주세요</p>
      <div className="mb-6">
        <Input
          placeholder="ex) 19990114"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />
      </div>

      {error && <p className="text-caption text-state-error mb-4">{error}</p>}

      <div className="flex justify-between mt-8">
        <Button label="← 이전" size="medium" type="black" onClick={onBack} />
        <Button label="다음 →" size="medium" type="purple" onClick={handleNext} />
      </div>
    </div>
  );
}