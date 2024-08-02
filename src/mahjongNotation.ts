// mahjongNotation.ts

export class MahjongNotationParser {
    static parseMahjongNotation(notation: string): string[] {
        const tiles: string[] = [];
        const groups = notation.split(/\s+|\|/).filter(group => group.trim() !== '');

        for (const group of groups) {
            let currentNumber = '';
            let isRotated = false;
            let isStacked = false;
            for (let i = 0; i < group.length; i++) {
                const char = group[i];
                if (char >= '0' && char <= '9') {
                    currentNumber += char;
                } else if (char === 'm' || char === 'p' || char === 's' || char === 'z') {
                    if (currentNumber === '') {
                        throw new Error(`Invalid notation: suit without number before ${char}`);
                    }
                    const numbers = currentNumber.split('');
                    for (const num of numbers) {
                        let tile = this.normalizeTile(`${num}${char}`);
                        if (isRotated) {
                            tile += "'";
                            isRotated = false;
                        }
                        if (isStacked) {
                            tile += '"';
                            isStacked = false;
                        }
                        tiles.push(tile);
                    }
                    currentNumber = '';
                } else if (char === '-') {
                    tiles.push('space');
                } else if (char === "'") {
                    isRotated = true;
                } else if (char === '"') {
                    isStacked = true;
                } else {
                    throw new Error(`Invalid character in notation: ${char}`);
                }
            }
            if (currentNumber !== '') {
                throw new Error(`Invalid notation: number without suit at the end of group`);
            }
        }

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