/// <reference types="node" />
export declare namespace Encapsulation {
    enum Commands {
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
     * @param status Status Code
     * @returns Human Readable Error Message
     */
    function parseStatus(status: number): string;
    /** Compact Packet Format  */
    namespace CPF {
        type dataItem = {
            TypeID: number;
            length?: number;
            data: Buffer;
        };
        const ItemIDs: Record<string, number>;
        /**
         * Checks if the specified command number is a known command
         * @param cmd Command number to check
         * @returns if the command is a known command
         */
        function isCmd(cmd: number): boolean;
        /**
         * Builds a Common Packet Formatted Buffer to be
         * Encapsulated.
         *
         * @param dataItems - Array of CPF Data Items
         * @returns CPF Buffer to be Encapsulated
         */
        function build(dataItems: Array<dataItem>): Buffer;
        /**
         * Parses Incoming Common Packet Formatted Buffer
         * and returns an Array of Objects.
         *
         * @param buf - Common Packet Formatted Data Buffer
         * @returns Array of Common Packet Data Objects
         */
        function parse(buf: Buffer): dataItem[];
    }
    namespace Header {
        /**
         *
         * @param cmd command number to use
         * @param session session id to use
         * @param data data buffer to send
         * @returns Encapsulated data
         */
        function build(cmd: number, session?: number, data?: Buffer | number[]): Buffer;
        interface ParsedHeader {
            /** Encapsulation command code */
            commandCode: number;
            /** Encapsulation command string interpretation */
            command: string;
            /** Length of encapsulated data */
            length: number;
            /** Session ID */
            session: number;
            /** Status code */
            statusCode: number;
            /** Status code sitrng interpretation */
            status: string;
            /** Options (Typically 0x00) */
            options: number;
            /** Encapsulated Data buffer */
            data: Buffer;
        }
        /**
         * Parses an header
         * @param buf header to parse
         * @returns parsed header
         */
        function parse(buf: Buffer): ParsedHeader;
    }
    /**
     * Creates a register session packet
     * @returns register Session packet
     */
    function registerSession(): Buffer;
    /**
     * Returns an Unregister Session Request Buffer
     * @returns unregister Session packet
     */
    function unregisterSession(session: number): Buffer;
    /**
     * Returns a UCMM Encapsulated Packet Buffer
     * @returns sendRRData packet
     */
    function sendRRData(session: number, data: Buffer, timeout?: number): Buffer;
    /**
     * Returns a Connected Message Datagram (Transport Class 3) String
     * @returns sendUnitData packet
     */
    function sendUnitData(session: number, data: Buffer, ConnectionID: number, SequenceNumber: number): Buffer;
}
