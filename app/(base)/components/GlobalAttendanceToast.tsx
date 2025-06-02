"use client"; // ✅ 클라이언트 컴포넌트임을 명시

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie"; // ✅ 클라이언트 쿠키 관리
import { getAuthUserId } from "@/utils/GetAuthUserId.client"; // ✅ 로그인된 사용자의 ID를 클라이언트 쿠키에서 추출
import Toast from "../../components/Toast"; // ✅ 자동 닫힘 기능이 있는 Toast UI 컴포넌트

export default function GlobalAttendanceToast() {
    // ✅ 중복 호출 방지를 위한 ref
    const hasCalled = useRef(false);

    // ✅ Toast 상태 관리
    const [toast, setToast] = useState({
        show: false, // 표시 여부
        status: "success" as "success" | "error" | "info", // 상태 종류
        message: "", // 표시할 메시지
    });

    useEffect(() => {
        const checkAttendance = async () => {
            // ✅ 이미 호출했다면 다시 실행하지 않음
            if (hasCalled.current) return;
            hasCalled.current = true;

            // ✅ 현재 로그인된 사용자 ID 가져오기
            const memberId = await getAuthUserId();
            if (!memberId) return; // 로그인되지 않은 경우 중단

            // ✅ 오늘 날짜를 한국 시간 기준으로 포맷
            const today = new Date().toLocaleDateString("ko-KR", {
                timeZone: "Asia/Seoul",
            });

            try {
                // ✅ 출석 API 호출 (서버에 출석 요청)
                const res = await fetch("/api/member/attend", {
                    method: "POST",
                });

                // ❌ 실패한 경우 에러 처리
                if (!res.ok) throw new Error("출석 실패");

                // ✅ 응답 JSON에서 출석 날짜 추출
                const data = await res.json();
                const attendedDate: string | null = data.attendedDate;

                // ✅ 서버 응답의 출석일이 오늘이라면 이미 출석한 것
                const alreadyAttended = attendedDate === today;

                // ✅ 아직 출석하지 않았던 경우 성공 토스트 표시
                if (!alreadyAttended) {
                    setToast({
                        show: true,
                        status: "success",
                        message: "✅ 출석 체크 완료!",
                    });
                }

                // ✅ 출석 날짜를 쿠키로 저장 (1일 유지)
                if (attendedDate) {

                    // ✅ 한국 시각 자정 계산
                    const now = new Date();
                    const seoulNow = new Date(
                        now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
                    );
                    const midnight = new Date(seoulNow);

                    midnight.setHours(24, 0, 0, 0); // 다음날 00:00:00
                    const utcMidnight = new Date(
                        midnight.toLocaleString("en-US", { timeZone: "UTC" })
                    );

                    Cookies.set(`attendance`, attendedDate, {
                        expires: utcMidnight, // UTC 기준으로 자정에 만료
                        path: "/",
                    });
                }
            } catch (err) {
                // ✅ 실패 시 에러 토스트 표시
                console.warn("출석 체크 실패:", err);
                setToast({
                    show: true,
                    status: "error",
                    message: "⚠️ 출석 체크 실패",
                });
            }
        };

        // ✅ 컴포넌트 마운트 시 출석 체크 실행
        checkAttendance();
    }, []);

    // ✅ 토스트 UI 렌더링 (자동 사라짐)
    return (
        <Toast
            show={toast.show}
            status={toast.status}
            message={toast.message}
        />
    );
}
