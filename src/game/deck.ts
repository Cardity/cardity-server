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
                fs.readFile(config.deckPath + file, (error: NodeJS.ErrnoException | null, data: Buffer) => {
                    let deck: IDeck = JSON.parse(data.toString());
                    Deck.decks[deck.key] = deck;
                    console.log(Deck.decks);
                })
            });
        });

        setTimeout(() => {
            Deck.initialize();
        }, 3600 * 1000);
    }
}