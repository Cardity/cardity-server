import * as crypto from "crypto";

export default class CryptoUtil {
    public static createRandomString(length: number = 16): string {
        return crypto.randomBytes(length).toString("hex").slice(0, length);
    }
}
