"use client";

import Button from "@/app/components/Button";
import React from "react";

interface ArenaInputBoxProps {
    content: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    disabled: boolean;
}

export default function ArenaInputBox({
    content,
    onChange,
    onSend,
    disabled,
}: ArenaInputBoxProps) {
    return (
        <div className="flex items-end gap-2 mt-auto">
            <textarea
                value={content}
                onChange={onChange}
                placeholder="의견을 작성하세요... (남은 메시지: 0/5)"
                className="flex-1 resize-none rounded-lg bg-background-400 p-3 text-font-100 placeholder:text-font-300 h-[80px]"
                disabled={disabled}
            />
            <Button
                icon={
                    <img src="/icons/send.svg" alt="send" className="w-4 h-4" />
                }
                type="purple"
                size="send"
                onClick={onSend}
                disabled={disabled}
            />
        </div>
    );
}
