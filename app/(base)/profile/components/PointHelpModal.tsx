"use client";

import { useEffect, useId, useRef } from "react";

type PointHelpModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function PointHelpModal({ open, onClose }: PointHelpModalProps) {
    const dialogTitleId = useId();
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);

    // ✅ (1) 모달 열릴 때 body 스크롤 잠금 + 스크롤바 폭만큼 padding-right 보정
    useEffect(() => {
        if (!open) return;

        const body = document.body;

        // 스크롤바 폭 계산 (스크롤바가 없으면 0)
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        // 기존 인라인 스타일 백업
        const prevOverflow = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;

        // 스크롤 잠금 + 레이아웃 밀림 방지
        body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPaddingRight;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);

        // 열리면 닫기 버튼 포커스
        setTimeout(() => closeBtnRef.current?.focus(), 0);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            id="tier-point-help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="fixed inset-0 z-50"
        >
            {/* overlay */}
            <button
                type="button"
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
                aria-label="모달 닫기"
            />

            {/* panel */}
            <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background-300 p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3
                            id={dialogTitleId}
                            className="text-base font-semibold text-font-100"
                        >
                            포인트는 어떻게 쌓이고, 왜 줄어들까요?
                        </h3>
                    </div>
                </div>

                <div className="mt-5 space-y-4 text-sm text-font-100">
                    <div className="rounded-xl bg-background-200 p-4">
                        <div className="font-semibold">✅ 포인트 적립</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                            <li>
                                출석 체크:{" "}
                                <span className="font-semibold text-green-600">
                                    +5
                                </span>
                            </li>
                            <li>
                                리뷰 좋아요 획득:{" "}
                                <span className="font-semibold text-green-600">
                                    +5
                                </span>
                            </li>
                            <li>
                                투기장 무승부:{" "}
                                <span className="font-semibold text-green-600">
                                    +100
                                </span>
                            </li>
                            <li>
                                투기장 미성립:{" "}
                                <span className="font-semibold text-green-600">
                                    +100
                                </span>
                            </li>
                            <li>
                                투기장 승리:{" "}
                                <span className="font-semibold text-green-600">
                                    +190
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-background-200 p-4">
                        <div className="font-semibold">⚠️ 포인트 차감</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                            <li>
                                투기장 참여:{" "}
                                <span className="font-semibold text-red-500">
                                    -100
                                </span>
                            </li>
                            <li>
                                리뷰 좋아요 삭제:{" "}
                                <span className="font-semibold text-red-500">
                                    -5
                                </span>
                            </li>
                            <li>
                                리뷰 삭제:{" "}
                                <span className="font-semibold text-red-500">
                                    -5 ~ -100
                                </span>
                                <span>
                                    {" "}
                                    (해당 리뷰가 받은 좋아요 수에 비례해서
                                    줄어듭니다. 예: 좋아요 20개 받은 리뷰 삭제
                                    시 -100점)
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-background-200 p-4">
                        <div className="font-semibold">ℹ️ 티어 계산</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                            <li>처음 가입할 때 500점으로 시작합니다.</li>
                            <li>
                                0~999점은{" "}
                                <span className="font-semibold text-[#C97A40]">
                                    브론즈
                                </span>
                                , 1000~1999점은{" "}
                                <span className="font-semibold text-[#B0B0B0]">
                                    실버
                                </span>
                                , 2000~2999점은{" "}
                                <span className="font-semibold text-[#FFD700]">
                                    골드
                                </span>
                                , 3000~3999점은{" "}
                                <span className="font-semibold text-[#45E0FF]">
                                    플래티넘
                                </span>
                                , 4000점 이상은{" "}
                                <span className="font-semibold text-[#4C7DFF]">
                                    다이아몬드
                                </span>
                                입니다.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-background-200 px-4 py-2 text-sm text-font-100 hover:opacity-90"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
