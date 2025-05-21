// app/components/Button.tsx
import React, { ReactNode } from "react";
import { cn } from "@/utils/tailwindUtil";

type ButtonSize = "xs" | "small" | "medium" | "large" | "send";
type ButtonType = "purple" | "blue" | "black";

interface ButtonProps {
    label?: string;
    size?: ButtonSize;
    type?: ButtonType;
    onClick?: () => void;
    htmlType?: "button" | "submit" | "reset";
    disabled?: boolean;
    icon?: ReactNode; // 추가
}

const sizeClasses: Record<ButtonSize, string> = {
    xs: "w-[32px] h-[32px]",
    send: "w-[50px] h-[50px]",
    small: "w-[90px] h-[35px]",
    medium: "w-[150px] h-[50px]",
    large: "w-[250px] h-[40px]",
};

const typeClasses: Record<ButtonType, string> = {
    purple: "bg-primary-purple-200 text-font-100 hover:bg-primary-purple-300",
    blue: "bg-primary-blue-200 text-font-100 hover:bg-primary-blue-300",
    black: "bg-background-400 text-font-100 border border-line-100 hover:border-primary-purple-200",
};

const disabledClass = "opacity-50 cursor-not-allowed pointer-events-none";

export default function Button({
    label,
    size = "medium",
    type = "purple",
    onClick,
    htmlType = "button",
    disabled = false,
    icon, // 추가
}: ButtonProps) {
    const baseClass =
        "font-medium text-button rounded-[8px] transition duration-200 inline-flex items-center justify-center gap-1";

    const className = cn(
        baseClass,
        sizeClasses[size],
        typeClasses[type],
        disabled && disabledClass
    );

    return (
        <button
            className={className}
            onClick={onClick}
            disabled={disabled}
            type={htmlType}
        >
            {icon}
            {label}
        </button>
    );
}
