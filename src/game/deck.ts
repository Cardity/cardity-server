import * as fs from "fs";
import * as config from "./../../config.json";

interface IDeck {
    key: number;
    name: string;
    questionCards: string[];
    wordCards: string[];
}

export default class Deck {
    static decks: { [key: number]: IDeck } = {};

    public static initialize() {
        fs.readdir(config.deckPath, (error: NodeJS.ErrnoException | null, files: string[]) => {
            files.forEach((file: string) => {
                if (!file.endsWith(".json")) {
                    return;
                }
                fs.readFile(config.deckPath + file, (error: NodeJS.ErrnoException | null, data: Buffer) => {
                    let deck: IDeck = JSON.parse(data.toString());
                    Deck.decks[deck.key] = deck;
                })
            });
        });

        setTimeout(() => {
            Deck.initialize();
        }, 3600 * 1000);
    }
}