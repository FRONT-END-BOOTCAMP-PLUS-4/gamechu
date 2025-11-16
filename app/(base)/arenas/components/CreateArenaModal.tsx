"use client";

import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

export default function CreateArenaModal() {
    const { isOpen, closeModal } = useModalStore();
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [startDate, setStartDate] = useState<Date>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setMinutes(0, 0, 0);
        return tomorrow;
    });

    // 모달 열렸을 때 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleSubmit = async () => {
        // 제목 비어있음
        if (!title.trim()) {
            Swal.fire({
                icon: "error",
                title: "제목이 작성되지 않았습니다.",
                text: "도전장 제목을 작성해주세요.",
                background: "#1f1f1f",
                color: "#fff",
                confirmButtonColor: "#ef4444",
            });
            return;
        }

        // 내용 비어있음
        if (!description.trim()) {
            Swal.fire({
                icon: "error",
                title: "내용이 작성되지 않았습니다.",
                text: "도전장 내용을 작성해주세요.",
                background: "#1f1f1f",
                color: "#fff",
                confirmButtonColor: "#ef4444",
            });
            return;
        }

        // 날짜가 현재보다 이전
        if (startDate <= new Date()) {
            Swal.fire({
                icon: "error",
                title: "날짜가 올바르지 않습니다",
                text: "시작 시간은 현재 이후로 설정해주세요.",
                background: "#1f1f1f",
                color: "#fff",
                confirmButtonColor: "#ef4444",
            });
            return;
        }

        // 작성 후 수정 불가 안내
        const confirmed = await Swal.fire({
            title: "도전장 작성",
            text: "작성 후 수정이 불가능합니다. 계속 진행하시겠습니까?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "작성",
            cancelButtonText: "취소",
            background: "#1f1f1f",
            color: "#fff",
            confirmButtonColor: "#ef4444",
        });
        if (!confirmed.isConfirmed) return;

        try {
            const arenaResult = await fetch(`/api/member/arenas`, {
                method: "POST",
                body: JSON.stringify({
                    title,
                    description,
                    startDate,
                }),
            });
            if (arenaResult.ok) {
                closeModal();
                Swal.fire({
                    icon: "success",
                    title: "등록 완료!",
                    text: "도전장이 정상적으로 등록되었습니다.",
                    confirmButtonColor: "#22c55e",
                    background: "#1f1f1f",
                    color: "#fff",
                }).then(() => {
                    window.location.reload();
                });
            }

            // TODO: get policyId and actualScore from Score Policy Database
            const scoreRecordResult = await fetch(`/api/member/scores`, {
                method: "POST",
                body: JSON.stringify({
                    policyId: 4,
                    actualScore: -100,
                }),
            });
            const scoreRecord = await scoreRecordResult.json();
            if (scoreRecordResult.ok) {
                closeModal();
                console.log("점수 기록 생성 성공:", scoreRecord);
            }
        } catch (error: unknown) {
            console.error("Failed to post arena", error);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={closeModal}>
            <div className="flex flex-col gap-4">
                {/* ✅ 제목 */}
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    <Image
                        src="/icons/arena2.svg"
                        alt="투기장 아이콘"
                        width={30}
                        height={30}
                        className="object-contain"
                    />
                    <span>도전장 작성</span>
                </h2>

                <div className="rounded-sm border border-yellow-600 bg-yellow-50/10 px-4 py-2 text-sm text-yellow-400">
                    작성 후 수정이 불가능합니다.{" "}
                    <br className="block sm:hidden" />
                    내용을 신중히 작성해주세요.
                </div>
                {/* ✅ 도전장 제목 입력 */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-white">도전장 제목</label>
                    <input
                        type="text"
                        placeholder="토론 주제를 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded border border-zinc-600 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-400 focus:border-zinc-100 focus:outline-none"
                    />
                </div>

                {/* ✅ 도전 내용 입력 */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-white">도전 내용</label>
                    <textarea
                        placeholder="토론장 내용을 입력하세요"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-48 resize-none rounded border border-zinc-600 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-400"
                    />
                </div>

                {/* ✅ 일정  */}
                <div className="flex flex-col text-black">
                    <label className="mb-2 text-sm text-white">시작 시간</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => {
                            if (date) setStartDate(date);
                        }}
                        showTimeSelect
                        timeIntervals={10} // ⏱ 10분 단위
                        timeCaption="시간"
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>

                {/* ✅ 하단 버튼 영역 */}
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={closeModal}
                        type="red"
                        label="취소하기"
                        size="small"
                    />
                    <Button
                        onClick={handleSubmit}
                        label="작성하기"
                        size="small"
                    />
                </div>
            </div>
        </ModalWrapper>
    );
}
