// app/(auth)/log-in/LoginPage.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { Session } from "next-auth";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import { useAuthStore } from "@/stores/AuthStore";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("이메일 형식이 잘못되었습니다.");
            return;
        }

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        if (res?.ok) {
            const session = await getSession();
            if (session?.user) {
                useAuthStore
                    .getState()
                    .setUser(session.user as Session["user"]);
            }
            router.push(callbackUrl);
        } else {
            alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden font-sans">
            {/* 움직이는 배경 */}
            <div
                className="absolute inset-0 animate-slow-pan bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/images/login-bg.png')",
                    backgroundSize: "200% 100%",
                }}
            />

            {/* 어두운 반투명 레이어 */}
            <div className="absolute inset-0 z-0 bg-black bg-opacity-50" />

            {/* 로그인 콘텐츠 */}
            <div className="relative z-10 flex min-h-screen items-center justify-center">
                <div
                    className="w-full max-w-[400px] rounded-xl bg-background-300 bg-opacity-90 p-10 shadow-lg"
                    style={{ minHeight: "400px" }} // ✅ 높이 고정
                >
                    <div className="mb-8 flex justify-center">
                        <Link href="/">
                            <Image
                                src="/icons/gamechu-logo.svg"
                                alt="GAMECHU 로고"
                                width={160}
                                height={160}
                                priority // ✅ LCP 요소 우선 로드
                                className="cursor-pointer"
                            />
                        </Link>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="w-[250px]">
                            <label className="mb-2 block text-body font-semibold text-font-100">
                                이메일
                            </label>
                            <Input
                                type="email"
                                placeholder="이메일 주소를 입력하세요"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                hasError={!!emailError}
                            />
                            {emailError && (
                                <p className="mt-1 text-caption text-state-error">
                                    {emailError}
                                </p>
                            )}
                        </div>

                        <div className="w-[250px]">
                            <label className="mb-2 block text-body font-semibold text-font-100">
                                비밀번호
                            </label>
                            <Input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex w-[250px] justify-center">
                            <Button
                                label="로그인"
                                size="large"
                                type="purple"
                                htmlType="submit"
                            />
                        </div>

                        <p className="mt-2 text-center text-caption text-font-200">
                            회원이 아니신가요?{" "}
                            <Link
                                href="/sign-up"
                                className="font-semibold text-primary-purple-100 hover:underline"
                            >
                                회원가입
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
