export default class DateUtil {
    static getCurrentTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }
}