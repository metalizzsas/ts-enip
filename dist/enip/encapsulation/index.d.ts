/// <reference types="node" />
export declare enum commands {
    NOP = 0,
    ListServices = 4,
    ListIdentity = 99,
    ListInterfaces = 100,
    RegisterSession = 101,
    UnregisterSession = 102,
    SendRRData = 111,
    SendUnitData = 112,
    IndicateStatus = 114,
    Cancel = 115
}
/**
 * Parses Encapulation Status Code to Human Readable Error Message.
 *
 * @param {number} status - Status Code
 * @returns {string} Human Readable Error Message
 */
export declare function parseStatus(status: number): string;
export declare namespace CPF {
    type dataItem = {
        TypeID: number;
        data: Buffer;
        length?: number;
    };
    const ItemIDs: Record<string, number>;
    function isCmd(cmd: number): boolean;
    /**
     * Builds a Common Packet Formatted Buffer to be
     * Encapsulated.
     *
     * @param {Array} dataItems - Array of CPF Data Items
     * @returns {Buffer} CPF Buffer to be Encapsulated
     */
    function build(dataItems: Array<dataItem>): Buffer;
    /**
     * Parses Incoming Common Packet Formatted Buffer
     * and returns an Array of Objects.
     *
     * @param {Buffer} buf - Common Packet Formatted Data Buffer
     * @returns {Array} Array of Common Packet Data Objects
     */
    function parse(buf: Buffer): Array<{
        TypeID: number;
        length: number;
        data: Buffer;
    }>;
}
export declare namespace header {
    function build(cmd: number, session?: number, data?: Buffer | Array<number>): Buffer;
    function parse(buf: Buffer): {
        commandCode: number;
        command: string;
        length: number;
        session: number;
        statusCode: number;
        status: string;
        options: number;
        data: Buffer;
    };
}
export declare function registerSession(): Buffer;
/**
 * Returns an Unregister Session Request String
 */
export declare function unregisterSession(session: number): Buffer;
/**
 * Returns a UCMM Encapsulated Packet String
 */
export declare function sendRRData(session: number, data: Buffer, timeout?: number): Buffer;
/**
 * Returns a Connected Message Datagram (Transport Class 3) String
 */
export declare function sendUnitData(session: number, data: Buffer, ConnectionID: number, SequenceNumber: number): Buffer;
