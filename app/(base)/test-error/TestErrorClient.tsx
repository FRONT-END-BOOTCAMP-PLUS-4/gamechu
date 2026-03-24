"use client";

export default function TestErrorClient(): never {
    throw new Error("테스트용 에러: 에러 바운더리 동작 확인");
}
