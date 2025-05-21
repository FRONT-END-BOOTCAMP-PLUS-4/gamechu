"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";

type Props = {
    onNext: () => void;
};

export default function StepProfile({ onNext }: Props) {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailDuplicate, setIsEmailDuplicate] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [gender, setGender] = useState<"M" | "F" | null>(null);
    const [birth, setBirth] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState("");

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
        setSuccessMessage("");
        setFieldErrors((prev) => ({ ...prev, email: "" }));

        if (!validateEmailFormat(email)) {
            setFieldErrors((prev) => ({ ...prev, email: "올바른 이메일 형식이 아닙니다." }));
            setIsEmailDuplicate(null);
            return;
        }

        try {
            const res = await fetch(`/api/auth/email-check?email=${encodeURIComponent(email)}`);
            const data = await res.json();

            if (res.status === 409) {
                setFieldErrors((prev) => ({ ...prev, email: data.message }));
                setIsEmailDuplicate(true);
                return;
            }

            if (!res.ok) {
                throw new Error(data.message || "중복 확인 실패");
            }

            setIsEmailDuplicate(false);
            setSuccessMessage(data.message);
        } catch (err) {
            const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
            setFieldErrors((prev) => ({ ...prev, email: message }));
            setIsEmailDuplicate(null);
        }
    };

    const handleNext = async () => {
        setSuccessMessage("");
        const errors: Record<string, string> = {};

        if (!nickname) errors.nickname = "닉네임을 입력해주세요.";
        if (!email) errors.email = "이메일을 입력해주세요.";
        else if (!validateEmailFormat(email)) errors.email = "올바른 이메일 형식이 아닙니다.";
        else if (isEmailDuplicate === null) errors.email = "이메일 중복 검사를 진행해주세요.";
        else if (isEmailDuplicate) errors.email = "이미 사용 중인 이메일입니다.";

        if (!password) errors.password = "비밀번호를 입력해주세요.";
        if (!confirm) errors.confirm = "비밀번호 확인을 입력해주세요.";
        if (password && confirm && password !== confirm) errors.confirm = "비밀번호가 일치하지 않습니다.";

        if (!gender) errors.gender = "성별을 선택해주세요.";

        const birthRegex = /^\d{8}$/;
        if (!birth) errors.birth = "생년월일을 입력해주세요.";
        else if (!birthRegex.test(birth) || !isValidDate(birth)) errors.birth = "유효한 생년월일을 입력해주세요.";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            // 1. 회원가입
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname, email, password, birthDate: birth, gender }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "회원가입 실패");

            // 2. 자동 로그인
            const loginRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (loginRes?.ok) {
                setSuccessMessage("회원가입 및 로그인 성공!");
                onNext();
            } else {
                setFieldErrors({ general: "회원가입은 성공했지만 로그인에 실패했습니다." });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "회원가입 중 오류 발생";
            setFieldErrors({ general: message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <label className="block text-body text-font-100 font-semibold">닉네임</label>
                <Input placeholder="닉네임을 입력하세요" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                {fieldErrors.nickname && <p className="text-caption text-state-error mt-1">{fieldErrors.nickname}</p>}
            </div>

            <div className="space-y-1">
                <label className="block text-body text-font-100 font-semibold">이메일</label>
                <div className="flex gap-2 items-start">
                    <div className="flex-1">
                        <Input
                            placeholder="이메일을 입력하세요"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setIsEmailDuplicate(null);
                            }}
                        />
                    </div>
                    <Button label="중복 검사" size="small" type="black" onClick={checkEmailDuplicate} />
                </div>
                {fieldErrors.email && <p className="text-caption text-state-error mt-1">{fieldErrors.email}</p>}
                {!fieldErrors.email && successMessage && <p className="text-caption text-state-success mt-1">{successMessage}</p>}
            </div>

            <div className="space-y-1">
                <label className="block text-body text-font-100 font-semibold">비밀번호</label>
                <Input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
                {fieldErrors.password && <p className="text-caption text-state-error mt-1">{fieldErrors.password}</p>}
            </div>

            <div className="space-y-1">
                <label className="block text-body text-font-100 font-semibold">비밀번호 확인</label>
                <Input type="password" placeholder="비밀번호를 다시 입력하세요" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                {fieldErrors.confirm && <p className="text-caption text-state-error mt-1">{fieldErrors.confirm}</p>}
            </div>

            <div className="space-y-1">
                <label className="block text-body text-font-100 font-semibold">성별</label>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setGender("M")}
                        className={`w-[150px] h-[50px] rounded-xl font-semibold transition-all duration-200 ${
                            gender === "M"
                                ? "bg-primary-blue-200 text-white shadow-md"
                                : "bg-background-200 text-font-100 border border-line-200 hover:border-primary-blue-200"
                        }`}
                    >
                        남자
                    </button>
                    <button
                        onClick={() => setGender("F")}
                        className={`w-[150px] h-[50px] rounded-xl font-semibold transition-all duration-200 ${
                            gender === "F"
                                ? "bg-primary-purple-200 text-white shadow-md"
                                : "bg-background-200 text-font-100 border border-line-200 hover:border-primary-purple-200"
                        }`}
                    >
                        여자
                    </button>
                </div>
                {fieldErrors.gender && <p className="text-caption text-state-error text-center mt-1">{fieldErrors.gender}</p>}
            </div>

            <div className="space-y-1">
                <label className="block text-body text-font-100 font-semibold">생년월일</label>
                <Input placeholder="ex) 20000101" value={birth} onChange={(e) => setBirth(e.target.value)} />
                {fieldErrors.birth && <p className="text-caption text-state-error mt-1">{fieldErrors.birth}</p>}
            </div>

            {fieldErrors.general && (
                <p className="text-caption text-state-error mt-2">{fieldErrors.general}</p>
            )}

            <div className="mt-8 text-right">
                <Button label="다음 →" onClick={handleNext} />
            </div>
        </div>
    );
}
