"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import { useAuthStore } from "@/stores/AuthStore";
import { Session } from "next-auth";

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
        setEmailError("");

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
            router.push(callbackUrl); // ✅ 로그인 이전 페이지로 이동
        } else {
            alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-400 font-sans">
            <div className="bg-background-300 p-10 rounded-xl w-full max-w-[400px] shadow-lg">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Image
                            src="/icons/logo.svg"
                            alt="GAMECHU 로고"
                            width={160}
                            height={160}
                            className="cursor-pointer"
                        />
                    </Link>
                </div>


                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-6 items-center"
                >
                    <div className="w-[250px]">
                        <label className="block text-font-100 font-semibold mb-2 text-body">
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
                            <p className="text-caption text-state-error mt-1">
                                {emailError}
                            </p>
                        )}
                    </div>

                    <div className="w-[250px]">
                        <label className="block text-font-100 font-semibold mb-2 text-body">
                            비밀번호
                        </label>
                        <Input
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="w-[250px] flex justify-center">
                        <Button
                            label="로그인"
                            size="large"
                            type="purple"
                            htmlType="submit"
                        />
                    </div>

                    <p className="text-center text-caption text-font-200 mt-2">
                        회원이 아니신가요?{" "}
                        <Link
                            href="/sign-up"
                            className="text-primary-purple-100 font-semibold hover:underline"
                        >
                            회원가입
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
