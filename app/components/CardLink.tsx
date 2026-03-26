import Link from "next/link";
import { ReactNode } from "react";

type CardLinkProps = {
    href: string;
    children: ReactNode;
    className?: string;
    "aria-label"?: string;
};

export default function CardLink({
    href,
    children,
    className,
    "aria-label": ariaLabel,
}: CardLinkProps) {
    return (
        <Link
            href={href}
            aria-label={ariaLabel}
            className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-purple-100 ${className ?? ""}`}
        >
            {children}
        </Link>
    );
}
