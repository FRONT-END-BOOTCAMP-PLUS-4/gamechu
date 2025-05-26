"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";

interface Props {
    nickname: string;
    email: string;
    password: string;
    imageUrl: string;
    birthDate: string; // yyyy-mm-dd
    isMale: boolean;
}

export default function ProfileInfoTab(props: Props) {
    const [isEdit, setIsEdit] = useState(false);
    const [nickname, setNickname] = useState(props.nickname);
    const [gender, setGender] = useState<"M" | "F">(props.isMale ? "M" : "F");
    const [birth, setBirth] = useState(
        props.birthDate.slice(0, 10).replace(/-/g, "")
    );
    const [previewImage, setPreviewImage] = useState(props.imageUrl);
    const [, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full bg-background-300 p-6 rounded-xl shadow flex flex-col gap-8">
            <h2 className="text-lg font-semibold text-body">프로필 정보</h2>

            <div className="flex flex-col gap-6">
                {/* 프로필 이미지 */}
                <div className="space-y-1">
                    <label className="block text-body text-font-100 font-semibold">
                        프로필 이미지
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="w-[80px] h-[80px] rounded-full overflow-hidden">
                            <Image
                                src={previewImage || "/images/default.png"}
                                alt="프로필 미리보기"
                                width={80}
                                height={80}
                            />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={!isEdit}
                        />
                        <Button
                            label="이미지 변경"
                            type="black"
                            size="small"
                            disabled={!isEdit}
                            onClick={() => fileInputRef.current?.click()}
                        />
                    </div>
                </div>

                {/* 닉네임 */}
                <div className="space-y-1">
                    <label className="block text-body text-font-100 font-semibold">
                        닉네임
                    </label>
                    <Input
                        placeholder="닉네임을 입력하세요"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        disabled={!isEdit}
                    />
                </div>

                {/* 이메일 (수정 불가) */}
                <div className="space-y-1">
                    <label className="block text-body text-font-100 font-semibold">
                        이메일
                    </label>
                    <Input
                        value={props.email}
                        disabled
                        className="bg-background-200"
                    />
                </div>

                {/* 성별 선택 */}
                <div className="space-y-1">
                    <label className="block text-body text-font-100 font-semibold">
                        성별
                    </label>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => isEdit && setGender("M")}
                            className={`w-[150px] h-[50px] rounded-xl font-semibold transition-all duration-200 ${
                                gender === "M"
                                    ? "bg-primary-blue-200 text-white shadow-md"
                                    : "bg-background-200 text-font-100 border border-line-200 hover:border-primary-blue-200"
                            } ${
                                !isEdit ? "cursor-not-allowed opacity-50" : ""
                            }`}
                        >
                            남자
                        </button>
                        <button
                            onClick={() => isEdit && setGender("F")}
                            className={`w-[150px] h-[50px] rounded-xl font-semibold transition-all duration-200 ${
                                gender === "F"
                                    ? "bg-primary-purple-200 text-white shadow-md"
                                    : "bg-background-200 text-font-100 border border-line-200 hover:border-primary-purple-200"
                            } ${
                                !isEdit ? "cursor-not-allowed opacity-50" : ""
                            }`}
                        >
                            여자
                        </button>
                    </div>
                </div>

                {/* 생년월일 */}
                <div className="space-y-1">
                    <label className="block text-body text-font-100 font-semibold">
                        생년월일
                    </label>
                    <Input
                        placeholder="ex) 20000101"
                        value={birth}
                        onChange={(e) => setBirth(e.target.value)}
                        disabled={!isEdit}
                    />
                </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end w-full gap-2 pt-4">
                {isEdit ? (
                    <>
                        <Button
                            label="수정 완료"
                            onClick={async () => {
                                try {
                                    const res = await fetch(
                                        "/api/member/profile",
                                        {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                nickname,
                                                isMale: gender === "M",
                                                birthDate: birth,
                                                imageUrl: previewImage,
                                            }),
                                        }
                                    );

                                    if (!res.ok) {
                                        const error = await res.json();
                                        alert(
                                            error.message || "프로필 수정 실패"
                                        );
                                        return;
                                    }

                                    alert("프로필이 수정되었습니다.");
                                    setIsEdit(false);
                                } catch (err) {
                                    console.error("프로필 수정 중 오류:", err);
                                    alert("예기치 못한 오류가 발생했습니다.");
                                }
                            }}
                        />
                        <Button
                            label="취소"
                            type="black"
                            onClick={() => setIsEdit(false)}
                        />
                    </>
                ) : (
                    <Button label="수정하기" onClick={() => setIsEdit(true)} />
                )}
            </div>
        </div>
    );
}
