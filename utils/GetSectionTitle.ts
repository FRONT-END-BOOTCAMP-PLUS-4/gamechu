export function GetSectionTitle(status: number): string {
    switch (status) {
        case 1:
            return "도전자를 찾는중인 투기장";
        case 2:
            return "대기중인 투기장";
        case 3:
            return "토론이 진행중인 투기장";
        case 4:
            return "투표가 진행중인 투기장";
        case 5:
            return "종료된 투기장";
        default:
            return "투기장 목록";
    }
}
