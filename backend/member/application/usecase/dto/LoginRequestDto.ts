export class LoginRequestDto {
    constructor(
        public readonly email: string,
        public readonly password: string
    ) {}
}
