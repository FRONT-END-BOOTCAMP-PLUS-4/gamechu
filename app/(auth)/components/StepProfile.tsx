"use client";

import { useState } from "react";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";

interface Props {
    onNext: () => void;
}

export default function StepProfile({ onNext }: Props) {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailDuplicate, setIsEmailDuplicate] = useState<boolean | null>(
        null
    );
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [gender, setGender] = useState<"M" | "F" | null>(null);
    const [birth, setBirth] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const validateEmailFormat = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        setErrorMessage("");

        if (!validateEmailFormat(email)) {
            setErrorMessage("올바른 이메일 형식이 아닙니다.");
            setIsEmailDuplicate(null);
            return;
        }

        try {
            const res = await fetch(
                `/api/auth/email-check?email=${encodeURIComponent(email)}`
            );
            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("서버 응답을 처리할 수 없습니다.");
            }

            if (!res.ok) {
                throw new Error(data.error || "중복 확인 실패");
            }

            setIsEmailDuplicate(data.isDuplicate);
            setSuccessMessage(
                data.isDuplicate
                    ? "이미 사용 중인 이메일입니다."
                    : "사용 가능한 이메일입니다."
            );
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "오류가 발생했습니다.";
            setErrorMessage(message);
            setIsEmailDuplicate(null);
        }
    };

    const handleNext = async () => {
        setSuccessMessage("");
        setErrorMessage("");

        if (!nickname || !email || !password || !confirm || !gender || !birth) {
            setErrorMessage("모든 항목을 입력해주세요.");
            return;
        }
        if (!validateEmailFormat(email)) {
            setErrorMessage("올바른 이메일 형식이 아닙니다.");
            return;
        }
        if (isEmailDuplicate === null) {
            setErrorMessage("이메일 중복 검사를 진행해주세요.");
            return;
        }
        if (isEmailDuplicate === true) {
            setErrorMessage("이미 사용 중인 이메일입니다.");
            return;
        }
        if (password !== confirm) {
            setErrorMessage("비밀번호가 일치하지 않습니다.");
            return;
        }
        const birthRegex = /^\d{8}$/;
        if (!birthRegex.test(birth) || !isValidDate(birth)) {
            setErrorMessage("유효한 생년월일을 입력해주세요.");
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nickname,
                    email,
                    password,
                    birthDate: birth,
                    gender,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "회원가입 실패");

            sessionStorage.setItem("memberId", data.memberId);
            setSuccessMessage("회원가입 성공!");
            onNext();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "회원가입 중 오류 발생";
            setErrorMessage(message);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block mb-1 text-body text-font-100 font-semibold">
                    닉네임
                </label>
                <Input
                    placeholder="닉네임을 입력하세요"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
            </div>

            <div>
                <label className="block mb-1 text-body text-font-100 font-semibold">
                    이메일
                </label>
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
                    <Button
                        label="중복 검사"
                        size="small"
                        type="black"
                        onClick={checkEmailDuplicate}
                    />
                </div>
            </div>
            <div>
                {errorMessage && (
                    <p className="text-caption text-state-error mb-4">
                        {errorMessage}
                    </p>
                )}
                {successMessage && (
                    <p className="text-caption text-state-success mb-4">
                        {successMessage}
                    </p>
                )}
            </div>

            <div>
                <label className="block mb-1 text-body text-font-100 font-semibold">
                    비밀번호
                </label>
                <Input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div>
                <label className="block mb-1 text-body text-font-100 font-semibold">
                    비밀번호 확인
                </label>
                <Input
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />
            </div>

            <div>
                <label className="block mb-1 text-body text-font-100 font-semibold">
                    성별
                </label>
                <div className="flex justify-center gap-4 mb-6">
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
            </div>

            <div>
                <label className="block mb-1 text-body text-font-100 font-semibold">
                    생년월일
                </label>
                <Input
                    placeholder="ex) 20000101"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                />
            </div>

            <div className="mt-8 text-right">
                <Button label="다음 →" onClick={handleNext} />
            </div>
        </div>
    );
}
