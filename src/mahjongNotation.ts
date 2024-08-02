//|| src/mahjongNotation.ts
// mahjongNotation.ts

export class MahjongNotationParser {
    static parseMahjongNotation(notation: string): string[] {
        const tiles: string[] = [];
        let currentNumbers = '';
        let currentSuit = '';
        let modifiers: string[] = [];

        const finalizeTiles = () => {
            if (currentNumbers && currentSuit) {
                for (let i = 0; i < currentNumbers.length; i++) {
                    let tile = this.normalizeTile(`${currentNumbers[i]}${currentSuit}`);
                    if (modifiers[i]) {
                        tile += modifiers[i];
                    }
                    tiles.push(tile);
                }
                currentNumbers = '';
                currentSuit = '';
                modifiers = [];
            } else if (currentNumbers && !currentSuit) {
                throw new Error(`Invalid notation: number without suit at the end of group`);
            }
        };

        for (let i = 0; i < notation.length; i++) {
            const char = notation[i];
            if (char >= '0' && char <= '9') {
                currentNumbers += char;
                modifiers.push('');
            } else if (char === 'm' || char === 'p' || char === 's' || char === 'z') {
                if (currentNumbers === '') {
                    throw new Error(`Invalid notation: suit without number before ${char}`);
                }
                if (currentSuit && currentSuit !== char) {
                    finalizeTiles();
                }
                currentSuit = char;
                finalizeTiles();
            } else if (char === '-') {
                finalizeTiles();
                tiles.push('space');
            } else if (char === "'" || char === '"') {
                if (currentNumbers.length > 0) {
                    modifiers[currentNumbers.length - 1] += char;
                } else if (tiles.length > 0) {
                    let lastTile = tiles.pop()!;
                    tiles.push(lastTile + char);
                }
            } else if (char === ' ' || char === '|') {
                finalizeTiles();
            } else {
                throw new Error(`Invalid character in notation: ${char}`);
            }
        }

        finalizeTiles();

        return tiles;
    }

    private static normalizeTile(tile: string): string {
        // Convert red five notation to a consistent format
        if (tile[0] === '0') {
            return `5${tile[1]}r`;  // e.g., '0m' becomes '5mr'
        }
        return tile;
    }
}

export function parseHand(notation: string): string[] {
    return MahjongNotationParser.parseMahjongNotation(notation);
}