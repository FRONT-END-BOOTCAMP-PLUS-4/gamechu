"use client";

import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import Pager from "@/app/components/Pager";
import { endpointClientChangedSubscribe } from "next/dist/build/swc/generated-native";

type NotificationModalProps = {
    id: number;
    name: string;
    description: string;
};

export default function NotificationModal(props: NotificationModalProps) {
    const { isOpen, closeModal } = useModalStore();

    // TODO: get data from API
    let currentPage = 1;
    let pages = [1, 2, 3, 4, 5];
    let endPage = 5;

    return (
        <ModalWrapper isOpen={isOpen} onClose={closeModal}>
            <NotificationList />
            <Pager
                currentPage={currentPage}
                pages={pages}
                endPage={endPage}
                onPageChange={(newPage: number) => (currentPage = newPage)}
            />
        </ModalWrapper>
    );
}
