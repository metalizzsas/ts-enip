/// <reference types="node" />
import { Socket } from "net";
import { EventEmitter } from "stream";
import { Encapsulation } from "./encapsulation";
export declare namespace ENIP {
    type ENIPState = {
        TCPState: States;
        session: {
            id: number;
            state: States;
        };
        connection: {
            id: number;
            seq_num: number;
            state: States;
        };
        error: {
            code: number;
            msg: string;
        };
    };
    enum States {
        UNCONNECTED = "unconnected",
        ESTABLISHED = "established",
        ESTABLISHING = "establishing"
    }
    interface ENIPEvents {
        "Session Registration Failed": (error: {
            code: number;
            msg: string;
        }) => void;
        "Session Registered": (sessionid: number) => void;
        "Session Unregistered": () => void;
        "SendRRData Received": (data: Encapsulation.CPF.dataItem[]) => void;
        "SendUnitData Received": (data: Encapsulation.CPF.dataItem[]) => void;
        "Unhandled Encapsulated Command Received": (data: Encapsulation.Header.ParsedHeader) => void;
        "close": () => void;
    }
    interface ENIPEventEmitter extends EventEmitter {
        on<U extends keyof ENIPEvents>(event: U, listener: ENIPEvents[U]): this;
        once<U extends keyof ENIPEvents>(event: U, listener: ENIPEvents[U]): this;
        emit<U extends keyof ENIPEvents>(event: U, ...args: Parameters<ENIPEvents[U]>): boolean;
    }
    /**
     * Low Level Ethernet/IP
     */
    export class SocketController {
        state: ENIPState;
        socket: Socket;
        events: ENIPEventEmitter;
        constructor();
        /**
         * Initializes Session with Desired IP Address or FQDN
         * and Returns a Promise with the Established Session ID
         */
        connect(IP_ADDR: string, timeoutSP?: number): Promise<number | undefined>;
        /**
         * Writes Ethernet/IP Data to Socket as an Unconnected Message
         * or a Transport Class 1 Datagram
         */
        write(data: Buffer, connected?: boolean, timeout?: number): Promise<boolean>;
        /**
         * Sends Unregister Session Command and Destroys Underlying TCP Socket
         * @deprecated
         */
        destroy(_error?: Error): void;
        /**
         * Sends an UnregisterSession command
         */
        close(): void;
        /**
         * Socket data event handler
         */
        private handleData;
        /**
         * Handle socket close
         */
        private handleClose;
    }
    export {};
}
