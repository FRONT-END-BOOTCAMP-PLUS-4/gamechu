import ClientNotFoundView from "./components/ClientNotFoundView";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden bg-background-400">
      <ClientNotFoundView />
    </div>
  );
}
