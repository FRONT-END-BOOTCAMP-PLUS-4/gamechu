import { verifyJWT } from "./jwt";

export async function getMemberIdFromToken(authHeader: string) {
    const token = authHeader.replace("Bearer ", "")!;

    try {
        const payload = await verifyJWT(token);
        const { id } = payload as { id: string };
        return id;
    } catch (error) {
        console.error(`Error verifying JWT token: ${error}`);
        return null;
    }
}
