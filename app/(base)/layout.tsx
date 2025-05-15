import Footer from "../components/Footer";
import Header from "../components/Header";
import "../globals.css";
export { viewport } from "../viewport";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
                <Header />
                <main>{children}</main>
                <Footer />
        </>   
    );
}
