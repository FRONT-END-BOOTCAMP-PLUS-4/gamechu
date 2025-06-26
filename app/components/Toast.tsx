"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface GlobalToastProps {
    show: boolean;
    status: "success" | "error" | "info";
    message: string;
    duration?: number; // 기본값: 3000ms
}

export default function Toast({
    show,
    status,
    message,
    duration = 3000,
}: GlobalToastProps) {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        if (!show) return;
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);
        return () => clearTimeout(timer);
    }, [show, duration]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="global-toast"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.4 }}
                    className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl text-white text-sm font-medium z-50
                        ${
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
