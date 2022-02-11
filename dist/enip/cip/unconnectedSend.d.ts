/// <reference types="node" />
import { ConnectionManager } from "./connectionManager";
export declare namespace UnconnectedSend {
    /**
     * Gets the Best Available Timeout Values
     *
     * @param {number} timeout - Desired Timeout in ms
     * @returns {UCMMSendTimeout}
     */
    function generateEncodedTimeout(timeout: number): ConnectionManager.UCMMSendTimeout;
    /**
     * Builds an Unconnected Send Packet Buffer
     *
     * @param {buffer} message_request - Message Request Encoded Buffer
     * @param {buffer} path - Padded EPATH Buffer
     * @param {number} [timeout=2000] - timeout
     * @returns {buffer}
     */
    function build(message_request: Buffer, path: Buffer, timeout?: number): Buffer;
}
