"use client";

import { useEffect, useRef } from "react";

export default function GlobalAttendanceChecker() {
    const hasCalled = useRef(false); // 중복 호출 방지

    useEffect(() => {
        if (hasCalled.current) return;
        hasCalled.current = true;

        fetch("/api/member/attend", {
            method: "POST",
        })
            .then((res) => {
                if (!res.ok) throw new Error("출석 실패");
                console.log("✅ 출석 체크 완료");
            })
            .catch((err) => {
                console.warn("출석 체크 오류:", err);
            });
    }, []);

    return null; // UI 출력 없음
}
