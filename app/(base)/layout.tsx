import Footer from "../components/Footer";
import Header from "../components/Header";
import "../globals.css";
export { viewport } from "../viewport";

export default function BaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="max-w-[1480px] mx-auto px-10 bg-background-400 text-font-100 font-sans">
                {children}
            </main>
            <Footer />
        </>
    );
}
