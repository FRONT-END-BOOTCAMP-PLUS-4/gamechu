export class SignUpRequestDto {
    constructor(
        public readonly nickname: string,
        public readonly email: string,
        public readonly password: string,
        public readonly birthDate: string, // YYYYMMDD
        public readonly gender: "M" | "F"
    ) {}
}
