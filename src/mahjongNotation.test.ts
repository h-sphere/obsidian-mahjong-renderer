import { parseHand } from './mahjongNotation';

describe('Mahjong Notation Parser', () => {
    it('parses a simple hand correctly', () => {
        const input = '123m456p789s11z';
        const expected = ['1m', '2m', '3m', '4p', '5p', '6p', '7s', '8s', '9s', '1z', '1z'];
        expect(parseHand(input)).toEqual(expected);
    });

    it('parses a hand with spaces correctly', () => {
        const input = '345m 1111p 678s 22z';
        const expected = ['3m', '4m', '5m', '1p', '1p', '1p', '1p', '6s', '7s', '8s', '2z', '2z'];
        expect(parseHand(input)).toEqual(expected);
    });

    it('handles red fives correctly', () => {
        const input = '0m 567p 34567s 789p';
        const expected = ['5mr', '5p', '6p', '7p', '3s', '4s', '5s', '6s', '7s', '7p', '8p', '9p'];
        expect(parseHand(input)).toEqual(expected);
    });

    it('throws error for invalid character', () => {
        const input = '123m456q789s11z';
        expect(() => parseHand(input)).toThrow('Invalid character in notation: q');
    });

    it('throws error for number without suit', () => {
        const input = '123m456p789s11';
        expect(() => parseHand(input)).toThrow('Invalid notation: number without suit at the end of group');
    });

    it('throws error for suit without number', () => {
        const input = '123mm456p789s11z';
        expect(() => parseHand(input)).toThrow('Invalid notation: suit without number before m');
    });

    it('parses hand with pipes correctly', () => {
        const input = '123m|456p|789s|11z';
        const expected = ['1m', '2m', '3m', '4p', '5p', '6p', '7s', '8s', '9s', '1z', '1z'];
        expect(parseHand(input)).toEqual(expected);
    });

    it('handles mixed separators correctly', () => {
        const input = '123m 456p|789s 11z';
        const expected = ['1m', '2m', '3m', '4p', '5p', '6p', '7s', '8s', '9s', '1z', '1z'];
        expect(parseHand(input)).toEqual(expected);
    });

    it('handles separators (-) correctly', () => {
        expect(parseHand('1m-2p 3s')).toEqual(['1m', 'space', '2p', '3s'])
    });

    it('handles separators within block correctly', () => {
        expect(parseHand('1234-567m')).toEqual(['1m', '2m', '3m', '4m', 'space', '5m', '6m', '7m'])
    });

    it('handles rotations correctly', () => {
        expect(parseHand("1'2m")).toEqual(["1m'", '2m'])
        expect(parseHand("12'm 56'7s")).toEqual(['1m', "2m'", '5s', "6s'", '7s'])
    })

    it('handles stacking correctly', () => {
        expect(parseHand('1"m')).toEqual(['1m"'])
        expect(parseHand('1"234m')).toEqual(['1m"', '2m', '3m', '4m'])
        expect(parseHand('123"4m')).toEqual(['1m', '2m', '3m"', '4m'])
    })
});