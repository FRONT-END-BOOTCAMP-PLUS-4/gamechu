"use client";
import Button from "@/app/components/Button";

export function ArenaRecruiting() {
    return (
        <div className="w-full max-w-[1000px] px-4 py-6 mt-6 text-center text-font-200 bg-background-300 rounded-lg min-h-[740px] animate-fade-in-up">
            <h2 className="text-lg mb-2 animate-pulse">
                도전 상대를 모집 중입니다.
            </h2>
            <p className="text-md mb-2 animate-pulse">도전해보세요!</p>
            <div className="animate-bounce w-fit mx-auto my-4">
                <img
                    src="/icons/arrowDown.svg"
                    alt="아래 화살표"
                    className="w-6 h-6"
                />
            </div>
            <Button label="참가하기" type="purple" size="large" />
        </div>
    );
}
