import { jwtVerify, SignJWT } from "jose";

const secret = process.env.JWT_SECRET!;
type PayloadType = {
    id: string;
    nickname: string;
    role: number;
};
export async function signJWT(payload: PayloadType, expiresIn = "1d") {
    const secretKey = new TextEncoder().encode(secret);
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(expiresIn)
        .sign(secretKey);

    return token;
}

export async function verifyJWT(token: string) {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    return payload;
}
