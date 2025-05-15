import React from "react";
import { cn } from "@/utils/tailwindUtil";

type ButtonSize = "xs" | "small" | "medium" | "large";
type ButtonType = "purple" | "blue" | "black" | "disabled";

interface ButtonProps {
    label: string;
    size?: ButtonSize;
    type?: ButtonType;
    onClick?: () => void;
    htmlType?: "button" | "submit" | "reset";
}

const sizeClasses: Record<ButtonSize, string> = {
    xs: "w-[32px] h-[32px]",
    small: "w-[90px] h-[35px]",
    medium: "w-[150px] h-[50px]",
    large: "w-[250px] h-[40px]",
};

const typeClasses: Record<ButtonType, string> = {
    purple: "bg-primary-purple-200 text-font-100 hover:bg-primary-purple-300",
    blue: "bg-primary-blue-200 text-font-100 hover:bg-primary-blue-300",
    black: "bg-background-400 text-font-100 border border-line-100 hover:border-primary-purple-200",
    disabled: "bg-primary-purple-100 text-font-200 cursor-not-allowed",
};

function Button({
    label,
    size = "medium",
    type = "purple",
    onClick,
    htmlType = "button",
}: ButtonProps) {
    const isDisabled = type === "disabled";

    const baseClass =
        "font-medium text-button rounded-[8px] transition duration-200";

    const className = cn(
        baseClass,
        sizeClasses[size],
        typeClasses[type],
        isDisabled && "pointer-events-none"
    );

    return (
        <button
            className={className}
            onClick={onClick}
            disabled={isDisabled}
            type={htmlType}
        >
            {label}
        </button>
    );
}

export default Button;
