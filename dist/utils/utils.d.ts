/// <reference types="node" />
/**
 * Wraps a Promise with a Timeout
 *
 * @param {Tag} tag - Tag Object to Write
 * @param {number} - Timeout Length (ms)
 * @param {Error|string} - Error to Emit if Timeout Occurs
 * @returns {Promise}
 * @memberof Controller
 */
export declare function promiseTimeout<T>(promise: Promise<T>, ms: number, error?: Error): Promise<T>;
/**
 * Delays X ms
 */
export declare function delay(ms: number): Promise<unknown>;
export declare function bufferToString(buff: Buffer): string;
export declare function stringToBuffer(str: string, len?: number): Buffer;
export declare function objToString(obj: any): string;
export declare function stringToObj(str: string, len?: number): unknown;
