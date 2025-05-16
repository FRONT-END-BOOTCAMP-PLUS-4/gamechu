'use client';

import { useState } from 'react';
import StepEmail from '../components/StepEmail';
import StepGenderBirth from '../components/StepGender';
import StepGenres from '../components/StepGenres';
import StepThemes from '../components/StepThemes';
import StepPlatforms from '../components/StepPlatforms';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    // 회원가입 요청 로직
    alert('회원가입이 완료되었습니다!');
    router.push('/log-in');
  };

  return (
    <div className="w-full max-w-xl mx-auto min-h-screen flex flex-col justify-between px-4 py-8 text-white">
      {step === 1 && <StepEmail onNext={nextStep} />}
      {step === 2 && <StepGenderBirth onNext={nextStep} onBack={prevStep} />}
      {step === 3 && <StepGenres onNext={nextStep} onBack={prevStep} />}
      {step === 4 && <StepThemes onNext={nextStep} onBack={prevStep} />}
      {step === 5 && <StepPlatforms onBack={prevStep} onSubmit={handleSubmit} />}

      {/* 진행도 표시 */}
      <div className="w-full mt-6">
        <div className="text-sm text-right mb-1">{step}/5 진행중</div>
        <div className="w-full h-[6px] bg-line-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-purple-200 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
