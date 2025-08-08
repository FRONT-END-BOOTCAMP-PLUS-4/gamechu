import LandingCard from "../components/LandingCard";

export const dynamic = "force-static"; // ✅ SSG 선언

export default function Home() {
    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center whitespace-nowrap break-keep bg-background-400 px-4 pb-20 font-sans text-font-100 lg:px-8">
            {" "}
            <div className="flex w-full max-w-7xl flex-col items-center gap-12 pt-12 lg:gap-20">
                {" "}
                {/* 텍스트 블럭 */}
                <div className="flex w-full flex-col px-2 text-center lg:px-6">
                    {" "}
                    <h1 className="mb-4 text-2xl font-bold lg:text-5xl">
                        <span
                            className="animate-fade-in-up-strong inline-block"
                            style={{ animationDelay: "0.1s" }}
                        >
                            게임
                        </span>{" "}
                        <span
                            className="animate-fade-in-up-strong inline-block"
                            style={{ animationDelay: "0.2s" }}
                        >
                            <span className="animate-gradient-xy bg-gradient-to-br from-primary-purple-300 via-purple-200 to-primary-purple-300 bg-[length:200%_200%] bg-clip-text text-transparent">
                                추천
                            </span>
                        </span>
                        <span
                            className="animate-fade-in-up-strong inline-block"
                            style={{ animationDelay: "0.3s" }}
                        >
                            과
                        </span>{" "}
                        <span
                            className="animate-fade-in-up-strong inline-block"
                            style={{ animationDelay: "0.4s" }}
                        >
                            <span className="animate-gradient-xy bg-gradient-to-br from-red-500 via-red-200 to-red-500 bg-[length:200%_200%] bg-clip-text text-transparent">
                                토론
                            </span>
                        </span>
                        <span
                            className="animate-fade-in-up-strong inline-block"
                            style={{ animationDelay: "0.5s" }}
                        >
                            의
                        </span>{" "}
                        <span
                            className="animate-fade-in-up-strong inline-block"
                            style={{ animationDelay: "0.6s" }}
                        >
                            장
                        </span>
                    </h1>
                    <p
                        className="animate-typing relative mx-auto max-w-full overflow-hidden whitespace-nowrap text-sm leading-relaxed text-font-200 lg:text-lg"
                        style={{ animationDelay: "1.5s" }}
                    >
                        원하는 서비스를 선택하여 게임에 대한
                    </p>
                    <p
                        className="animate-typing relative mx-auto max-w-full overflow-hidden whitespace-nowrap text-sm leading-relaxed text-font-200 lg:text-lg"
                        style={{ animationDelay: "2.3s" }}
                    >
                        열정을 함께 나눠보세요!
                    </p>
                </div>
                {/* 카드 메뉴 */}
                <div className="flex w-full flex-col gap-8 whitespace-normal break-keep lg:flex-row">
                    {" "}
                    <LandingCard
                        href="/games"
                        iconSrc="/icons/gamesearch.svg"
                        iconAlt="게임 탐색"
                        title="게임 탐색"
                        description="다양한 장르와 플랫폼의 게임을 탐색하고 자세한 정보를 확인해보세요. 당신에게 맞는 게임을 찾아드립니다."
                        backgroundSrc="/images/game-bg.png"
                        animationDelay="0.4s"
                        animationClassName="animate-fade-in-left-strong"
                    />
                    <LandingCard
                        href="/arenas"
                        iconSrc="/icons/arena.svg"
                        iconAlt="투기장"
                        title="투기장"
                        description="게임에 대한 열띤 토론에 참여하세요. 자신의 의견을 피력하고 다른 게이머들과 논쟁을 벌여보세요."
                        backgroundSrc="/images/arena-bg.png"
                        animationDelay="0.8s"
                        animationClassName="animate-fade-in-right-strong"
                    />
                </div>
            </div>
        </div>
    );
}
