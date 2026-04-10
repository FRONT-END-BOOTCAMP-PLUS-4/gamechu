"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import Toast from "../../components/Toast";

export default function GlobalAttendanceToast() {
    const hasCalled = useRef(false);

    const [toast, setToast] = useState({
        show: false,
        status: "success" as "success" | "error" | "info",
        message: "",
    });

    const { mutate: checkAttendance } = useMutation({
        mutationFn: () =>
            fetch("/api/member/attend", { method: "POST" }).then((res) => {
                if (!res.ok) throw new Error("출석 실패");
                return res.json() as Promise<{ attendedDate: string | null }>;
            }),
        onSuccess: (data) => {
            const today = new Date().toLocaleDateString("ko-KR", {
                timeZone: "Asia/Seoul",
            });
            const alreadyAttended = data.attendedDate === today;

            if (!alreadyAttended) {
                setToast({
                    show: true,
                    status: "success",
                    message: "✅ 출석 체크 완료!",
                });
            }

            if (data.attendedDate) {
                const now = new Date();
                const seoulNow = new Date(
                    now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
                );
                const midnight = new Date(seoulNow);
                midnight.setHours(24, 0, 0, 0);
                Cookies.set("attendance", data.attendedDate, {
                    expires: midnight,
                    path: "/",
                });
            }
        },
        onError: () => {
            setToast({
                show: true,
                status: "error",
                message: "⚠️ 출석 체크 실패",
            });
        },
    });

    useEffect(() => {
        const run = async () => {
            if (hasCalled.current) return;
            hasCalled.current = true;
            const memberId = await getAuthUserId();
            if (!memberId) return;
            checkAttendance();
        };
        run();
    }, [checkAttendance]);

    return (
        <Toast
            show={toast.show}
            status={toast.status}
            message={toast.message}
        />
    );
}
