/// <reference types="node" />
import { Socket } from "net";
declare type ENIPState = {
    TCP: {
        established: boolean;
        establishing: boolean;
    };
    session: {
        id: number | null;
        establishing: boolean;
        established: boolean;
    };
    connection: {
        id: number | null;
        establishing: boolean;
        established: boolean;
        seq_num: number;
    };
    error: {
        code: number | null;
        msg: string | null;
    };
};
/**
 * Low Level Ethernet/IP
 *
 * @class ENIP
 * @extends {Socket}
 * @fires ENIP#Session Registration Failed
 * @fires ENIP#Session Registered
 * @fires ENIP#Session Unregistered
 * @fires ENIP#SendRRData Received
 * @fires ENIP#SendUnitData Received
 * @fires ENIP#Unhandled Encapsulated Command Received
 */
export declare class ENIP extends Socket {
    state: ENIPState;
    constructor();
    /**
     * Returns an Object
     *  - <number> error code
     *  - <string> human readable error
     *
     * @readonly
     * @memberof ENIP
     */
    get error(): {
        code: number | null;
        msg: string | null;
    };
    /**
     * Session Establishment In Progress
     *
     * @readonly
     * @memberof ENIP
     */
    get establishing(): boolean;
    /**
     * Session Established Successfully
     *
     * @readonly
     * @memberof ENIP
     */
    get established(): boolean;
    /**
     * Get ENIP Session ID
     *
     * @readonly
     * @memberof ENIP
     */
    get session_id(): number | null;
    /**
     * Various setters for Connection parameters
     *
     * @memberof ENIP
     */
    set establishing_conn(newEstablish: boolean);
    set established_conn(newEstablished: boolean);
    set id_conn(newID: number | null);
    set seq_conn(newSeq: number);
    /**
     * Various getters for Connection parameters
     *
     * @memberof ENIP
     */
    get establishing_conn(): boolean;
    get established_conn(): boolean;
    get id_conn(): number | null;
    get seq_conn(): number;
    /**
     * Initializes Session with Desired IP Address or FQDN
     * and Returns a Promise with the Established Session ID
     *
     * @override
     * @param {string} IP_ADDR - IPv4 Address (can also accept a FQDN, provided port forwarding is configured correctly.)
     * @returns {Promise}
     * @memberof ENIP
     */
    connect_enip(IP_ADDR: string, timeoutSP?: number): Promise<unknown>;
    /**
     * Writes Ethernet/IP Data to Socket as an Unconnected Message
     * or a Transport Class 1 Datagram
     *
     * NOTE: Cant Override Socket Write due to net.Socket.write
     *        implementation. =[. Thus, I am spinning up a new Method to
     *        handle it. Dont Use Enip.write, use this function instead.
     */
    write_cip(data: Buffer, connected?: boolean, timeout?: number, cb?: (err?: Error) => void): void;
    /**
     * Sends Unregister Session Command and Destroys Underlying TCP Socket
     *
     * @override
     * @param {Exception} exception - Gets passed to 'error' event handler
     * @memberof ENIP
     */
    destroy(error?: Error): this;
    _initializeEventHandlers(): void;
    /**
     * @typedef EncapsulationData
     * @type {Object}
     * @property {number} commandCode - Ecapsulation Command Code
     * @property {string} command - Encapsulation Command String Interpretation
     * @property {number} length - Length of Encapsulated Data
     * @property {number} session - Session ID
     * @property {number} statusCode - Status Code
     * @property {string} status - Status Code String Interpretation
     * @property {number} options - Options (Typically 0x00)
     * @property {Buffer} data - Encapsulated Data Buffer
     */
    /*****************************************************************/
    /**
     * Socket.on('data) Event Handler
     *
     * @param {Buffer} - Data Received from Socket.on('data', ...)
     * @memberof ENIP
     */
    _handleDataEvent(data: Buffer): void;
    /**
     * Socket.on('close',...) Event Handler
     *
     * @param {Boolean} hadError
     * @memberof ENIP
     */
    _handleCloseEvent(hadError: boolean): void;
}
export {};
