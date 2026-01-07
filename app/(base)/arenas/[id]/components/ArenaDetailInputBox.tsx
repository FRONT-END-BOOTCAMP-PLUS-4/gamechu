"use client";

import Button from "@/app/components/Button";
import Image from "next/image";
import React from "react";

interface ArenaInputBoxProps {
    content: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    disabled: boolean;
    maxLength: number; // 최대 글자 수
    currentLength: number; // 현재 입력된 글자 수
    remainingSends: number; // 남은 메시지 전송 횟수
    totalSends: number; // 전체 허용 메시지 전송 횟수
    sendError: string | null; // 메시지 전송 관련 에러 메시지
}

export default function ArenaDetailInputBox({
    content,
    onChange,
    onSend,
    disabled,
    maxLength,
    currentLength,
    remainingSends,
    totalSends,
}: ArenaInputBoxProps) {
    // 글자 수 초과 여부 판단
    const isOverMaxLength = currentLength >= maxLength;
    // 남은 횟수가 0인지 판단
    const isSendCountZero = remainingSends <= 0;

    // 내용이 비어있는지 판단
    const isContentEmpty = content.trim().length === 0;

    // 최종 비활성화 여부
    const finalDisabled = disabled || isSendCountZero || isContentEmpty;

    // 엔터키 전송 핸들러
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!finalDisabled) onSend();
        }
    };

    return (
        <div className="mt-auto w-full">
            {/* 컨테이너 */}
            <div
                className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${
                    finalDisabled
                        ? "border-white/5 bg-white/5"
                        : "border-white/10 bg-white/10 focus-within:ring-1"
                }`}
            >
                {/* 텍스트 영역 */}
                <textarea
                    value={content}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isSendCountZero
                            ? "모든 전송 기회를 사용하셨습니다."
                            : `의견을 입력하세요...
Enter: 전송
Shift + Enter: 줄바꿈`
                    }
                    className="placeholder:text-font-400 min-h-[110px] w-full resize-none bg-transparent p-4 text-font-100 outline-none"
                    disabled={disabled || isSendCountZero}
                    maxLength={maxLength}
                />

                {/* 하단 유틸리티 바 */}
                <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                    {/* 상태 정보 영역 */}
                    <div className="flex gap-4 font-bold tracking-tight sm:text-xs">
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                            <span className="text-font-400 uppercase opacity-50">
                                Length
                            </span>
                            <span
                                className={
                                    isOverMaxLength
                                        ? "text-red-500"
                                        : "text-font-200"
                                }
                            >
                                {currentLength}{" "}
                                <span className="text-font-400 font-normal">
                                    / {maxLength}
                                </span>
                            </span>
                        </div>
                        <div className="h-3 w-[1px] self-center bg-white/10" />
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                            <span className="text-font-400 uppercase opacity-50">
                                Limit
                            </span>
                            <span
                                className={
                                    isSendCountZero
                                        ? "text-red-500"
                                        : "text-font-200"
                                }
                            >
                                {remainingSends}{" "}
                                <span className="text-font-400 font-normal">
                                    / {totalSends}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* 전송 버튼 */}
                    <div className="shrink-0 transition-transform active:scale-95">
                        <Button
                            icon={
                                <Image
                                    src="/icons/send.svg"
                                    alt="send"
                                    width={14}
                                    height={14}
                                    className={`transition-all duration-300 ${
                                        finalDisabled
                                            ? "opacity-100 grayscale"
                                            : "opacity-100 shadow-purple-400"
                                    }`}
                                />
                            }
                            type="purple"
                            size="send"
                            onClick={onSend}
                            disabled={finalDisabled}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
