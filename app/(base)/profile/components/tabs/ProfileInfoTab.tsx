// components/tabs/ProfileInfoTab.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Input from "@/app/components/Input";

interface Props {
    nickname: string;
    email: string;
    password: string;
    imageUrl: string;
    birthDate: string;
    isMale: boolean;
}

export default function ProfileInfoTab(props: Props) {
    const [isEdit, setIsEdit] = useState(false);

    // yyyy-mm-ddTHH:mm:ss.sssZ -> yyyy.mm.dd
    const formattedBirthDate = props.birthDate.slice(0, 10).replace(/-/g, ".");

    return (
        <div className="bg-background-300 rounded-xl shadow text-sm px-10 py-8 flex flex-col gap-8">
            <h2 className="text-lg font-semibold text-body">프로필 정보</h2>

            <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                        <Image
                            src={props.imageUrl || "/images/default.png"}
                            alt="프로필 이미지"
                            width={100}
                            height={100}
                        />
                    </div>
                </div>

                <div className="w-full max-w-[600px]">
                    <div className="font-medium mb-1">닉네임</div>
                    {isEdit ? (
                        <Input defaultValue={props.nickname} className="input w-full" />
                    ) : (
                        <div>{props.nickname}</div>
                    )}
                </div>

                <div className="w-full max-w-[600px]">
                    <div className="font-medium mb-1">이메일</div>
                    <div>{props.email}</div>
                </div>

                {isEdit && (
                    <div className="w-full max-w-[600px]">
                        <div className="font-medium mb-1">비밀번호</div>
                        <Input type="password" defaultValue={props.password} className="input w-full" />
                    </div>
                )}

                <div className="w-full max-w-[600px]">
                    <div className="font-medium mb-1">성별</div>
                    <div>{props.isMale ? "남자" : "여자"}</div>
                </div>

                <div className="w-full max-w-[600px]">
                    <div className="font-medium mb-1">생년월일</div>
                    <div>{formattedBirthDate}</div>
                </div>
            </div>

            <div className="flex justify-end w-full mt-6">
                <button
                    onClick={() => setIsEdit((prev) => !prev)}
                    className="px-4 py-2 rounded bg-primary-purple-200 text-white text-sm"
                >
                    {isEdit ? "수정 취소" : "수정하기"}
                </button>
            </div>
        </div>
    );
}
