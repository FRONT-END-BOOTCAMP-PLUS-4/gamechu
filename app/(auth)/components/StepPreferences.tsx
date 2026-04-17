"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import SelectionCard from "./SelectionCard";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";

type Item = { id: number; name: string };

type Props = {
    title: string;
    queryKey: readonly unknown[];
    fetchUrl: string;
    saveUrl: string;
    bodyKey: string;
    errorMessage: string;
    onBack: () => void;
    onComplete: () => void;
    submitLabel: string;
};

export default function StepPreferences({
    title,
    queryKey,
    fetchUrl,
    saveUrl,
    bodyKey,
    errorMessage,
    onBack,
    onComplete,
    submitLabel,
}: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [toast, setToast] = useState({
        show: false,
        status: "error" as const,
        message: "",
    });

    const { data: items = [] } = useQuery<Item[]>({
        queryKey,
        queryFn: () => fetcher(fetchUrl),
    });

    const { mutate: save } = useMutation({
        mutationFn: () =>
            fetch(saveUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [bodyKey]: selectedIds }),
            }).then((res) => {
                if (!res.ok) throw new Error(errorMessage);
            }),
        onSuccess: () => onComplete(),
        onError: () =>
            setToast({ show: true, status: "error", message: errorMessage }),
    });

    const toggleItem = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <div>
            <h2 className="mb-2 text-body font-semibold text-font-100">
                {title}
            </h2>

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {items.map((item) => (
                    <SelectionCard
                        key={item.id}
                        label={item.name}
                        selected={selectedIds.includes(item.id)}
                        onClick={() => toggleItem(item.id)}
                    />
                ))}
            </div>

            <Toast
                show={toast.show}
                status={toast.status}
                message={toast.message}
            />

            <div className="mt-8 flex justify-between">
                <Button
                    label="← 이전"
                    size="medium"
                    type="black"
                    onClick={onBack}
                />
                <Button
                    label={submitLabel}
                    size="medium"
                    type="purple"
                    onClick={() => save()}
                />
            </div>
        </div>
    );
}
