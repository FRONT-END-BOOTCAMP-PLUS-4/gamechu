import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      {/* 헤더는 항상 최상단에 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          {/* 메인 콘텐츠 */}
        </main>
      </div>

      {/* 푸터 */}
      <Footer />
    </>
  );
}
