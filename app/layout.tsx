import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="font-sans bg-background-400 text-font-100">
                <Header />
                <main className="w-full max-w-[1480px] mx-auto px-10">
                    <div className="w-full max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
                <Footer />
            </body>
        </html>
    );
}
