import "./globals.css";
export { viewport } from "./viewport";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="font-sans bg-background-400 text-font-100">
                <main className="max-w-[1400px] mx-auto px-10">{children}</main>
            </body>
        </html>
    );
}
