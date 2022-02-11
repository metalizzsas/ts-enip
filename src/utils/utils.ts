/**
 * Wraps a Promise with a Timeout
 *
 * @param {Tag} tag - Tag Object to Write
 * @param {number} - Timeout Length (ms)
 * @param {Error|string} - Error to Emit if Timeout Occurs
 * @returns {Promise}
 * @memberof Controller
 */
export function promiseTimeout<T>(promise: Promise<T>, ms: number, error = new Error("ASYNC Function Call Timed Out!!!")): Promise<T> {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(error), ms);
        promise.then(resolve).catch(reject);
    });
};

/**
 * Delays X ms
 */
export function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

// Helper Funcs to process strings
export function bufferToString(buff: Buffer): string
{
    let newBuff = Buffer.from(buff)
    const len = newBuff.readUInt32LE();
    return newBuff.slice(4, len + 4).toString();
};

export function stringToBuffer(str: string, len = 88): Buffer
{
    const buf = Buffer.alloc(len);
    str = str.slice(0, len - 6);
    buf.writeUInt32LE(str.length);
    Buffer.from(str).copy(buf, 4);
    return buf;
};

export function objToString(obj: any): string
{
    return String.fromCharCode(...obj.DATA.slice(0,obj.LEN));
};

export function stringToObj(str: string, len = 82): unknown
{
    
    const array = Array(len).fill(0);
    [...str].forEach((c, k) => {
        array[k] = c.charCodeAt(k);
    });

    return {
        LEN: str.length,
        DATA: array
    };
};