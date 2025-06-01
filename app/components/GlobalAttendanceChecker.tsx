"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";

export default function GlobalAttendanceChecker() {
    const hasCalled = useRef(false);
    const [showUI, setShowUI] = useState(false);
    const [status, setStatus] = useState<"success" | "error" | null>(null);

    useEffect(() => {
        const checkAttendance = async () => {
            if (hasCalled.current) return;
            hasCalled.current = true;

            const memberId = await getAuthUserId();
            if (!memberId) return;

            const today = new Date().toLocaleDateString("ko-KR", {
                timeZone: "Asia/Seoul",
            });

            try {
                const res = await fetch("/api/member/attend", {
                    method: "POST",
                });

                if (!res.ok) throw new Error("출석 실패");

                const data = await res.json();
                const attendedDate: string | null = data.attendedDate;

                // ✅ 서버 기준으로만 비교
                const alreadyAttended = attendedDate === today;

                if (!alreadyAttended) {
                    setShowUI(true);
                    setStatus("success");
                }

                // ❓ 쿠키는 선택적으로 저장 (원하면 생략 가능)
                if (attendedDate) {
                    Cookies.set(`attendance_${memberId}`, attendedDate, {
                        expires: 1,
                        path: "/",
                    });
                }
            } catch (err) {
                console.warn("출석 체크 실패:", err);
                setStatus("error");
                setShowUI(true);
            }
        };

        checkAttendance();

        return () => {
            setTimeout(() => setStatus(null), 3000);
        };
    }, []);

    return (
        <AnimatePresence>
            {showUI && status && (
                <motion.div
                    key="attendance-ui"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.4 }}
                    className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl text-white text-sm font-medium z-50 ${
                        status === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    {status === "success"
                        ? "✅ 출석 체크 완료!"
                        : "⚠️ 출석 체크 실패"}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
