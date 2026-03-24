import { notFound } from "next/navigation";
import TestErrorClient from "./TestErrorClient";

export default function TestErrorPage() {
    if (process.env.NODE_ENV === "production") {
        notFound();
    }
    return <TestErrorClient />;
}
