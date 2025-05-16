// components/Register/StepThemes.tsx
'use client';

import { useState } from 'react';
import SelectionCard from './SelectionCard';
import Button from '@/app/components/Button';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const THEMES = ['공포', '판타지', 'SF', '좀비', '디스토피아', '역사', '연애', '일상', '탐험', '미스터리'];

export default function StepThemes({ onNext, onBack }: Props) {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const handleNext = () => {
    if (selectedThemes.length === 0) {
      setError('테마를 하나 이상 선택해주세요.');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div>
      <h2 className="text-body text-font-100 font-semibold mb-2">선호하는 게임 테마를 선택해주세요</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {THEMES.map((theme) => (
          <SelectionCard
            key={theme}
            label={theme}
            selected={selectedThemes.includes(theme)}
            onClick={() => toggleTheme(theme)}
          />
        ))}
      </div>

      {error && <p className="text-caption text-state-error mb-4">{error}</p>}

      <div className="flex justify-between mt-8">
        <Button label="← 이전" size="medium" type="black" onClick={onBack} />
        <Button label="다음 →" size="medium" type="purple" onClick={handleNext} />
      </div>
    </div>
  );
}