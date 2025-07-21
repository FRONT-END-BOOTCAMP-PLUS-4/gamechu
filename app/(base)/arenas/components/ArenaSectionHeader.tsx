"use client";
import { GetSectionTitle } from "@/utils/GetSectionTitle";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ArenaSectionHeaderProps = {
    status: number;
};

export default function ArenaSectionHeader(props: ArenaSectionHeaderProps) {
    const title: string = GetSectionTitle(props.status);
    const router = useRouter();
    const handleQueryChange = (newPage: number, newStatus: number | null) => {
        router.push(`?currentPage=${newPage}&status=${newStatus}`);
    };

    return (
        <div className="flex flex-col items-start justify-between gap-4 px-6 md:flex-row md:items-center">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Image
                        src="/icons/arena2.svg"
                        alt="투기장 아이콘"
                        width={20}
                        height={20}
                        className="object-contain"
                    />
                    <h1 className="text-xl font-semibold text-font-100">
                        {title}
                    </h1>
                </div>
            </div>

            <button
                onClick={() => {
                    handleQueryChange(1, props.status);
                }}
                className="flex items-center gap-1 whitespace-nowrap text-base text-purple-500 hover:underline"
            >
                <span>모두 보기</span>
                <Image
                    src="/icons/arrowLink.svg"
                    alt="투기장 아이콘"
                    width={18}
                    height={18}
                    className="object-contain"
                />
            </button>
        </div>
    );
}
