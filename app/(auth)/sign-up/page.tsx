"use client";

import { useState } from "react";
import StepGenres from "../components/StepGenres";
import StepThemes from "../components/StepThemes";
import StepPlatforms from "../components/StepPlatforms";
import StepProfile from "../components/StepProfile";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";

export default function Register() {
    const [step, setStep] = useState(1);
    const router = useRouter();

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastStatus, setToastStatus] = useState<
        "success" | "error" | "info"
    >("success");

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = () => {
        setToastStatus("success");
        setToastMessage("회원가입이 완료되었습니다!");
        setShowToast(true);

        setTimeout(() => {
            router.push("/log-in");
        }, 2000); // 토스트 표시 후 이동
    };

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-8 text-white">
            <h2 className="mb-6 text-h2 font-bold">회원 정보를 입력해주세요</h2>
            <div className="mb-8 w-full">
                <div className="mb-1 text-right text-sm">{step}/4 진행중</div>
                <div className="h-[6px] w-full overflow-hidden rounded-full bg-line-200">
                    <div
                        className="h-full bg-primary-purple-200 transition-all duration-300"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>
            </div>

            {/* 스텝 컴포넌트 */}
            {step === 1 && <StepProfile onNext={nextStep} />}
            {step === 2 && <StepGenres onNext={nextStep} onBack={prevStep} />}
            {step === 3 && <StepThemes onNext={nextStep} onBack={prevStep} />}
            {step === 4 && (
                <StepPlatforms onBack={prevStep} onSubmit={handleSubmit} />
            )}

            {/* ✅ 토스트 메시지 컴포넌트 */}
            <Toast
                show={showToast}
                status={toastStatus}
                message={toastMessage}
            />
        </div>
    );
}
