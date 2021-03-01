export class DateUtil {
    static getCurrentTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }
}