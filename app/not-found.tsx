import ClientNotFoundView from "./components/ClientNotFoundView";

export default function NotFoundPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-background-400">
            <ClientNotFoundView />
        </div>
    );
}
