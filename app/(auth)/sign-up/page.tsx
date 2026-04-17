"use client";

import { useState } from "react";
import StepPreferences from "../components/StepPreferences";
import StepProfile from "../components/StepProfile";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";
import { queryKeys } from "@/lib/QueryKeys";

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
        }, 2000);
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

            {step === 1 && <StepProfile onNext={nextStep} />}
            {step === 2 && (
                <StepPreferences
                    title="선호하는 게임 장르를 선택해주세요"
                    queryKey={queryKeys.genres()}
                    fetchUrl="/api/genres"
                    saveUrl="/api/preferred-genres"
                    bodyKey="genreIds"
                    errorMessage="선호 장르 저장에 실패했습니다."
                    onBack={prevStep}
                    onComplete={nextStep}
                    submitLabel="다음 →"
                />
            )}
            {step === 3 && (
                <StepPreferences
                    title="선호하는 게임 테마를 선택해주세요"
                    queryKey={queryKeys.themes()}
                    fetchUrl="/api/themes"
                    saveUrl="/api/preferred-themes"
                    bodyKey="themeIds"
                    errorMessage="선호 테마 저장에 실패했습니다."
                    onBack={prevStep}
                    onComplete={nextStep}
                    submitLabel="다음 →"
                />
            )}
            {step === 4 && (
                <StepPreferences
                    title="이용하는 게임 플랫폼을 선택해주세요"
                    queryKey={queryKeys.platforms()}
                    fetchUrl="/api/platforms"
                    saveUrl="/api/preferred-platforms"
                    bodyKey="platformIds"
                    errorMessage="선호 플랫폼 저장에 실패했습니다."
                    onBack={prevStep}
                    onComplete={handleSubmit}
                    submitLabel="가입 완료"
                />
            )}

            <Toast
                show={showToast}
                status={toastStatus}
                message={toastMessage}
            />
        </div>
    );
}
