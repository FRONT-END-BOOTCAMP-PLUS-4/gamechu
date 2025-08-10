"use client";

import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import { useState } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

    const handleSubmit = async () => {
        if (
            !description.trim() ||
            !description.trim() ||
            startDate <= new Date()
        ) {
            // TODO: custom alert로 변경
            alert("모든 필드를 올바르게 입력해주세요.");
            return;
        }

        try {
            const arenaResult = await fetch(`/api/member/arenas`, {
                method: "POST",
                body: JSON.stringify({
                    title,
                    description,
                    startDate,
                }),
            });
            const arena = await arenaResult.json();
            if (arenaResult.ok) {
                closeModal();
                console.log("투기장 생성 성공:", arena);
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

                {/* ✅ 도전장 제목 입력 */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-white">도전장 제목</label>
                    <input
                        type="text"
                        placeholder="토론 주제를 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded border border-purple-500 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>

                {/* ✅ 도전 내용 입력 */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-white">도전 내용</label>
                    <textarea
                        placeholder="토론장 내용을 입력하세요"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-28 resize-none rounded border border-zinc-600 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-400"
                    />
                </div>

                {/* ✅ 일정  */}
                <div className="flex flex-col gap-2 text-black">
                    <label className="text-sm text-white">시작 시간</label>
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
                        type="black"
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
