"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ArenaSectionHeaderProps = {
    title: string;
    status: number;
};

export default function ArenaSectionHeader(props: ArenaSectionHeaderProps) {
    const router = useRouter();
    const handleQueryChange = (newPage: number, newStatus: number | null) => {
        router.push(`?currentPage=${newPage}&status=${newStatus}`);
    };

    return (
        <div className="px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                        {props.title}
                    </h1>
                </div>
            </div>

            <button
                onClick={() => {
                    handleQueryChange(1, props.status);
                }}
                className="flex items-center gap-1 text-base text-purple-500 hover:underline whitespace-nowrap"
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
