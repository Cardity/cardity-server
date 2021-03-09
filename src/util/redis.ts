import { RedisClient, ClientOpts } from "redis";
import { promisify } from "util";

export default class Redis extends RedisClient {
    getAsync: (key: string) => Promise<string | null>;
    setAsync: (key: string, value: string) => Promise<unknown>;

    constructor(options: ClientOpts) {
        super(options);

        this.getAsync = promisify(this.get).bind(this);
        this.setAsync = promisify(this.set).bind(this);
    }

    // public async getAsync(key: string): Promise<string | null> {
    //     let get = promisify(this.get).bind(this);
    //     return get(key);
    // }
}