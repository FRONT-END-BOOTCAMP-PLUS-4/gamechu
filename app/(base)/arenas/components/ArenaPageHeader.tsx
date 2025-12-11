"use client";
import Image from "next/image";
import Button from "@/app/components/Button";
import useModalStore from "@/stores/modalStore";

export default function ArenaPageHeader() {
    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-600/20 bg-gray-900/80 p-10 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
                <div className="flex items-center">
                    <Image
                        src="/icons/arena2.svg"
                        alt="투기장 아이콘"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                    <h1 className="text-3xl font-semibold text-font-100">
                        토론 투기장
                    </h1>
                </div>

                <p className="text-font-300 break-keep px-2 text-sm text-gray-400 sm:text-base">
                    게임에 대한 열띤 토론의 장입니다. 자신의 의견을 피력하고
                    다른 게이머들과 논쟁을 벌여보세요. 토론에서 승리하여 최고의
                    평론가로 인정받으세요.
                </p>

                <div className="rounded-2xl border border-gray-700 bg-gray-800/80 shadow-xl">
                    <div className="p-6">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-purple-400"></div>
                            <span className="text-sm font-semibold text-purple-400 sm:text-base">
                                포인트 규칙
                            </span>
                        </div>

                        <ul className="space-y-2 text-sm sm:text-base">
                            <li className="flex items-center gap-4">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-red-500/20 text-xs text-red-300">
                                    -
                                </span>
                                <span className="text-gray-300">
                                    도전장 작성 시{" "}
                                    <span className="font-bold text-red-400">
                                        100P 차감
                                    </span>
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-red-500/20 text-xs text-red-300">
                                    -
                                </span>
                                <span className="text-gray-300">
                                    투기장 참여 시{" "}
                                    <span className="font-bold text-red-400">
                                        100P 차감
                                    </span>
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-green-500/20 text-xs text-green-300">
                                    +
                                </span>
                                <span className="text-gray-300">
                                    투기장에서 승리 시{" "}
                                    <span className="font-bold text-green-400">
                                        190P 획득
                                    </span>
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-blue-500/20 text-xs text-blue-300">
                                    ↺
                                </span>
                                <span className="text-gray-300">
                                    토론 시작 시간까지 도전자가 나타나지 않는
                                    경우{" "}
                                    <span className="font-bold text-blue-400">
                                        100P 환불
                                    </span>{" "}
                                    및 투기장 자동 삭제
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0">
                <Button
                    label="도전장 작성하기"
                    type="purple"
                    size="large"
                    icon={
                        <Image
                            src="/icons/arena2-white.svg"
                            alt="투기장 아이콘"
                            width={18}
                            height={18}
                            className="object-contain"
                        />
                    }
                    onClick={() =>
                        useModalStore.getState().openModal("createArena", null)
                    }
                />
            </div>
        </div>
    );
}
