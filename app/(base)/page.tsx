import LandingCard from "../components/LandingCard";

export default function Home() {
    return (
        <div className="min-h-[calc(100vh-80px)] px-8 pb-20 sm:px-20 font-sans bg-background-400 text-font-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-[48px] w-full max-w-[1024px]">
                {/* 텍스트 블럭 */}
                <div className="text-center w-full animate-fade-in-left">
                    <h1 className="text-headline font-bold mb-4">
                        게임{" "}
                        <span className="text-primary-purple-200">추천</span>과{" "}
                        <span className="text-primary-purple-200">토론</span>의
                        장
                    </h1>
                    <p className="text-body text-font-200">
                        원하는 서비스를 선택하여 게임에 대한 열정을 함께
                        나눠보세요!
                    </p>
                </div>

                {/* 카드 메뉴 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                    <LandingCard
                        href="/games"
                        iconSrc="/icons/gamesearch.svg"
                        iconAlt="게임 탐색"
                        title="게임 탐색"
                        description="다양한 장르와 플랫폼의 게임을 탐색하고 자세한 정보를 확인해보세요. 당신에게 맞는 게임을 찾아드립니다."
                        animationDelay="0.2s"
                    />
                    <LandingCard
                        href="/arena"
                        iconSrc="/icons/arena.svg"
                        iconAlt="투기장"
                        title="투기장"
                        description="게임에 대한 열띤 토론에 참여하세요. 자신의 의견을 피력하고 다른 게이머들과 논쟁을 벌여보세요."
                        animationDelay="0.4s"
                    />
                </div>
            </div>
        </div>
    );
}
