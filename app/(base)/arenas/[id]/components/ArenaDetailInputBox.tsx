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
    const isOverMaxLength = currentLength > maxLength;

    // 남은 횟수가 0인지 판단
    const isSendCountZero = remainingSends <= 0;
    // 최종 disabled 상태 결정:
    // 부모에서 넘겨준 disabled가 true거나
    // 내용이 비어있거나,
    // 글자 수가 제한을 넘었거나,
    // 남은 횟수가 0이면 비활성화
    const finalDisabled = disabled || isOverMaxLength || isSendCountZero;
    return (
        <div className="flex items-end gap-2 mt-auto">
            <textarea
                value={content}
                onChange={onChange}
                placeholder="의견을 작성하세요..."
                maxLength={maxLength}
                className="flex-1 resize-none rounded-lg bg-background-400 p-3 text-font-100 placeholder:text-font-300 h-[80px]"
                disabled={finalDisabled}
            />
            {/* 현재 글자 수 및 남은 횟수 표시 영역 */}
            <div className="flex justify-between text-sm px-1 gap-4">
                {/* 글자 수 표시: 초과 시 빨간색 */}
                <span
                    className={`${
                        isOverMaxLength ? "text-red-500" : "text-font-300"
                    }`}
                >
                    {currentLength}/{maxLength}자
                </span>
                {/* 남은 횟수 표시: 0이면 빨간색 */}
                <span
                    className={`${
                        isSendCountZero ? "text-red-500" : "text-font-300"
                    }`}
                >
                    {remainingSends}/{totalSends}회
                </span>
            </div>
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
    );
}
