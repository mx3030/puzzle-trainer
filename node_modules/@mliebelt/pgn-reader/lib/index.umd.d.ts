import { ParseTree, PgnMove, PgnDate, PgnTime, TimeControl } from '@mliebelt/pgn-parser';

declare const PROMOTIONS: {
    q: string;
    r: string;
    b: string;
    n: string;
};
declare const prom_short: string[];
declare type PROMOTIONS_SHORT = typeof prom_short[number];
declare const colors: readonly ["white", "black"];
declare const files: readonly ["a", "b", "c", "d", "e", "f", "g", "h"];
declare const ranks: readonly ["1", "2", "3", "4", "5", "6", "7", "8"];
declare type File = typeof files[number];
declare type Rank = typeof ranks[number];
declare type Field = 'a0' | `${File}${Rank}`;
declare type GameComment = {
    comment?: string;
    colorArrows?: string[];
    colorFields?: string[];
    clk?: string;
    eval?: string;
};
declare type Color = 'w' | 'b';
declare type Shape = {
    brush: string;
    orig: Field;
    dest?: Field;
};
declare type PrimitiveMove = {
    from: Field;
    to: Field;
    promotion?: PROMOTIONS_SHORT;
};
declare type PgnReaderMove = {
    drawOffer?: boolean;
    moveNumber?: number;
    notation: {
        fig?: string | null;
        strike?: 'x' | null;
        col?: string;
        row?: string;
        check?: string;
        ep?: boolean;
        promotion?: string | null;
        notation: string;
        disc?: string;
        drop?: boolean;
    };
    variations: PgnReaderMove[];
    nag: string[];
    commentDiag?: GameComment;
    commentMove?: string;
    commentAfter?: string;
    turn?: Color;
    from: Field;
    to: Field;
    fen?: string;
    index?: number;
    prev?: number;
    next?: number;
    variationLevel?: number;
};
declare type PgnReaderConfiguration = {
    notation?: 'short' | 'long';
    position?: 'start' | string;
    locale?: string;
    lazyLoad?: boolean;
    manyGames?: boolean;
    pgn?: string;
    pgnFile?: string;
    startPlay?: number | string;
    hideMovesBefore?: boolean;
};
declare type Message = {
    key: string;
    value: string;
    message: string;
};

declare const NAGs: any[];
declare const PGN_NAGS: {};
/**
 * Returns the NAG notation from the array of symbols
 * @param array the NAG symbols like $1, $3, ...
 * @returns {string} the result string like !, !!
 */
declare function nagToSymbol(array: any): string;
/**
 * Returns the SYM notation for a single NAG (like !!, ?!, ...)
 * @param string the NAG in the chess notation
 * @returns {*} the symbold like $0, $3, ...
 */
declare function symbolToNag(string: any): string | null;
declare function hasDiagramNag(move: any): boolean;

/**
 * Defines the base functionality for reading and working with PGN.
 * The configuration is the part of the configuration given to the PgnViewer that is relevant
 * for the reader.
 * The reader is an abstraction that just knows the current games, and handles changes by keeping the change
 * in the state of the game. So all local storage in the reader should be avoided besides `configuration`, `games`
 * and `currentGameIndex`.
 * @param {*} configuration Given values are relevant for reading and working with PGN
 */
declare class PgnReader {
    configuration: PgnReaderConfiguration;
    games: ParseTree[];
    moves: PgnReaderMove[];
    chess: any;
    currentGameIndex: number;
    endGame: string;
    constructor(configuration: PgnReaderConfiguration);
    /**
     * Returns the real notation from the move (excluding NAGs).
     * @param move given move in JSON notation
     * @return {*} the SAN string created from the move
     */
    san(move: PgnReaderMove): string;
    sanWithNags(move: PgnReaderMove): string;
    loadPgn(): PgnReader;
    loadMany(): void;
    loadOne(game: ParseTree | number): void;
    possibleMoves(move: number | string): Map<Field, Field[]>;
    readMoves(moves: PgnMove[]): void;
    isMove(id: number): boolean;
    isDeleted(id: number): boolean;
    getMove(id: number): PgnReaderMove | undefined;
    deleteMove(id: number): void;
    updateVariationLevel(move: PgnReaderMove, varLevel: number): void;
    findMove(moveRep: number | string): PgnReaderMove | undefined;
    deleteMovesBefore(moveRep: number | string): string;
    promoteMove(id: number): void;
    startMainLine(move: PgnReaderMove): boolean;
    startVariation(move: PgnReaderMove): boolean;
    endVariation(move: PgnReaderMove): boolean;
    afterMoveWithVariation(move: PgnReaderMove): boolean;
    writePgn(): string;
    /**
     * Sets the position to the start position, depending on the configuration. Returns the resulting position as FEN string.
     * @return string The position as FEN string
     */
    setToStart(): string;
    eachMove(movesMainLine: PgnMove[]): void;
    addMove(move: PrimitiveMove, moveNumber: number): number;
    changeNag(_nag: string, moveNumber: number, added: boolean): void;
    clearNags(moveNumber: number): void;
    getOrderedMoves(current: PgnReaderMove, returnedMoves: PgnReaderMove[]): PgnReaderMove[];
    getMoves(): PgnReaderMove[];
    getFirstMove(): PgnReaderMove | null;
    getTags(): Map<string, string | Message[] | PgnDate | PgnTime | TimeControl>;
    getGameComment(): GameComment;
    getGames(): ParseTree[];
    getEndGame(): string;
    getPosition(index: number | null): any;
    setShapes(move: PgnReaderMove, shapes: Shape[]): void;
}

declare class StringBuilder {
    strings: Array<string>;
    constructor(value: string);
    append(value: any): StringBuilder;
    isEmpty(): boolean;
    lastChar(): string;
    toString(): string;
}

export { Color, Field, File, GameComment, Message, NAGs, PGN_NAGS, PROMOTIONS, PROMOTIONS_SHORT, PgnReader, PgnReaderConfiguration, PgnReaderMove, PrimitiveMove, Rank, Shape, StringBuilder, colors, files, hasDiagramNag, nagToSymbol, prom_short, ranks, symbolToNag };
