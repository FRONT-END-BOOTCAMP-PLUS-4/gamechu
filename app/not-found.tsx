import NotFoundLottie from "./components/NotFoundLottie";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <NotFoundLottie /> {/* <- 클라이언트 컴포넌트 */}
      <h1 className="text-2xl mt-4">페이지를 찾을 수 없습니다</h1>
    </div>
  );
}
