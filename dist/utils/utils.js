"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToObj = exports.objToString = exports.stringToBuffer = exports.bufferToString = exports.delay = exports.promiseTimeout = void 0;
/**
 * Wraps a Promise with a Timeout
 *
 * @param {Tag} tag - Tag Object to Write
 * @param {number} - Timeout Length (ms)
 * @param {Error|string} - Error to Emit if Timeout Occurs
 * @returns {Promise}
 * @memberof Controller
 */
function promiseTimeout(promise, ms, error = new Error("ASYNC Function Call Timed Out!!!")) {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(error), ms);
        promise.then(resolve).catch(reject);
    });
}
exports.promiseTimeout = promiseTimeout;
;
/**
 * Delays X ms
 */
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
exports.delay = delay;
// Helper Funcs to process strings
function bufferToString(buff) {
    let newBuff = Buffer.from(buff);
    const len = newBuff.readUInt32LE();
    return newBuff.slice(4, len + 4).toString();
}
exports.bufferToString = bufferToString;
;
function stringToBuffer(str, len = 88) {
    const buf = Buffer.alloc(len);
    str = str.slice(0, len - 6);
    buf.writeUInt32LE(str.length);
    Buffer.from(str).copy(buf, 4);
    return buf;
}
exports.stringToBuffer = stringToBuffer;
;
function objToString(obj) {
    return String.fromCharCode(...obj.DATA.slice(0, obj.LEN));
}
exports.objToString = objToString;
;
function stringToObj(str, len = 82) {
    const array = Array(len).fill(0);
    [...str].forEach((c, k) => {
        array[k] = c.charCodeAt(k);
    });
    return {
        LEN: str.length,
        DATA: array
    };
}
exports.stringToObj = stringToObj;
;
