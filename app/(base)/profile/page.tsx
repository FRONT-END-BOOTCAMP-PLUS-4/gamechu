"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";

export default function ProfilePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserId = useCallback(async () => {
        const id = await getAuthUserId();
        setUserId(id);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUserId();
    }, [fetchUserId]);

    return (
        <main style={{ padding: "2rem" }}>
            <h1>프로필 페이지</h1>
            <p>여기는 유저의 프로필 정보를 보여주는 페이지입니다.</p>

            {loading ? (
                <p>로딩 중...</p>
            ) : userId ? (
                <p>
                    <strong>유저 ID:</strong> {userId}
                </p>
            ) : (
                <p>로그인된 유저 정보가 없습니다.</p>
            )}
        </main>
    );
}
