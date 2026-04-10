"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type GlobalToastProps = {
    show: boolean;
    status: "success" | "error" | "info";
    message: string;
    duration?: number; // 기본값: 3000ms
};

export default function Toast({
    show,
    status,
    message,
    duration = 3000,
}: GlobalToastProps) {
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        if (!show) return;
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);
        return () => clearTimeout(timer);
    }, [show, duration]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="global-toast"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.4 }}
                    className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform rounded-xl px-6 py-3 text-sm font-medium text-white shadow-xl ${
                        status === "success"
                            ? "bg-green-500"
                            : status === "error"
                              ? "bg-red-500"
                              : "bg-blue-500"
                    }`}
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
