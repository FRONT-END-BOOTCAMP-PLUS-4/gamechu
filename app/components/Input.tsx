"use client";

import { InputHTMLAttributes, ReactElement } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
    renderRight?: ReactElement;
    variant?: "outlined" | "filled";
    inputClassName?: string;
    className?: string;
}

export default function Input({
    hasError = false,
    renderRight,
    variant = "filled",
    inputClassName = "",
    className = "",
    ...props
}: Props) {
    const baseStyle =
        "w-full px-4 py-2 text-caption text-font-100 placeholder-font-200 border border-line-200 rounded focus:outline-none";

    const variantStyle = {
        filled: "bg-background-200",
        outlined: "bg-transparent",
    };

    const errorStyle = hasError
        ? "border border-state-error placeholder-state-error focus:ring-1 focus:ring-state-error"
        : "";

    return (
        <div className={`relative ${className}`}>
            <input
                className={`${baseStyle} ${variantStyle[variant]} ${errorStyle} ${inputClassName}`}
                {...props}
            />
            {renderRight && (
                <div className="absolute inset-y-0 right-3 flex items-center text-state-error">
                    {renderRight}
                </div>
            )}
        </div>
    );
}
