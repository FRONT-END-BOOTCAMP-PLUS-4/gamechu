"use client";

import Button from "@/app/components/Button";
import Image from "next/image";
import React from "react";

interface ArenaInputBoxProps {
    content: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    disabled: boolean;
    maxLength: number; // 추가: 최대 글자 수
    currentLength: number; // 추가: 현재 입력된 글자 수
    remainingSends: number; // 추가: 남은 메시지 전송 횟수
    totalSends: number; // 추가: 전체 허용 메시지 전송 횟수 (예: 5)
    sendError: string | null; // 추가: 메시지 전송 관련 에러 메시지 (ex: 횟수 초과, 길이 초과 등)
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
    const finalDisabled = disabled || isSendCountZero;
    return (
        <div className="flex items-end gap-2 mt-auto w-full">
            {/* 텍스트박스 + 하단 인풋 상태 표시 포함 */}
            <div className="flex-1 flex flex-col gap-1">
                <textarea
                    value={content}
                    onChange={onChange}
                    placeholder="의견을 작성하세요..."
                    className="resize-none rounded-lg bg-background-400 p-3 text-font-100 placeholder:text-font-300 h-[80px] w-full"
                    disabled={finalDisabled}
                    maxLength={maxLength}
                />
                <div className="flex justify-between text-sm text-font-300">
                    <span
                        className={`${
                            isOverMaxLength ? "text-red-500 font-medium" : ""
                        }`}
                    >
                        {currentLength} / {maxLength}자
                    </span>
                    <span
                        className={`${
                            isSendCountZero ? "text-red-500 font-medium" : ""
                        }`}
                    >
                        남은 횟수: {remainingSends} / {totalSends}
                    </span>
                </div>
            </div>

            {/* 전송 버튼 */}
            <div className="self-center">
                <Button
                    icon={
                        <Image
                            src="/icons/send.svg"
                            alt="send"
                            width={16}
                            height={16}
                        />
                    }
                    type="purple"
                    size="send"
                    onClick={onSend}
                    disabled={finalDisabled}
                />
            </div>
        </div>
    );
}
