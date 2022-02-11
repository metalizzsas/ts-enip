export enum commands{
    NOP = 0x00,
    ListServices = 0x04,
    ListIdentity = 0x63,
    ListInterfaces = 0x64,
    RegisterSession = 0x65, // Begin Session Command
    UnregisterSession = 0x66, // Close Session Command
    SendRRData = 0x6f, // Send Unconnected Data Command
    SendUnitData = 0x70, // Send Connnected Data Command
    IndicateStatus = 0x72,
    Cancel = 0x73
};

// region Validation Helper Functions

/**
 * Parses Encapulation Status Code to Human Readable Error Message.
 *
 * @param {number} status - Status Code
 * @returns {string} Human Readable Error Message
 */
export function parseStatus(status: number)
{
    switch (status) {
        case 0x00:
            return "SUCCESS";
        case 0x01:
            return "FAIL: Sender issued an invalid ecapsulation command.";
        case 0x02:
            return "FAIL: Insufficient memory resources to handle command.";
        case 0x03:
            return "FAIL: Poorly formed or incorrect data in encapsulation packet.";
        case 0x64:
            return "FAIL: Originator used an invalid session handle.";
        case 0x65:
            return "FAIL: Target received a message of invalid length.";
        case 0x69:
            return "FAIL: Unsupported encapsulation protocol revision.";
        default:
            return `FAIL: General failure <${status}> occured.`;
    }
};

/**
 * Checks if Command is a Valid Encapsulation Command
 *
 * @param {Number} ecapsulation command
 * @returns {boolean} test result
 */
function validateCommand(cmd: number)
{
    return Object.values(commands).includes(cmd);
};
// endregion

// region Compact Packet Format

export namespace CPF
{
    export type dataItem = {
        TypeID: number,
        data: Buffer,
        length?: number
    };

    export const ItemIDs: Record<string, number> = {
        Null: 0x00,
        ListIdentity: 0x0c,
        ConnectionBased: 0xa1,
        ConnectedTransportPacket: 0xb1,
        UCMM: 0xb2,
        ListServices: 0x100,
        SockaddrO2T: 0x8000,
        SockaddrT2O: 0x8001,
        SequencedAddrItem: 0x8002
    };

    export function isCmd(cmd: number): boolean {       

        for (let key of Object.keys(ItemIDs)) {
            if (cmd === ItemIDs[key]) return true;
        }
        return false;
    }

    /**
     * Builds a Common Packet Formatted Buffer to be
     * Encapsulated.
     *
     * @param {Array} dataItems - Array of CPF Data Items
     * @returns {Buffer} CPF Buffer to be Encapsulated
     */
    export function build(dataItems: Array<dataItem>): Buffer {
        // Write Item Count and Initialize Buffer
        let buf = Buffer.alloc(2);
        buf.writeUInt16LE(dataItems.length, 0);

        for (let item of dataItems) {
            const { TypeID, data } = item;

            if (!isCmd(TypeID)) throw new Error("Invalid CPF Type ID!");

            let buf1 = Buffer.alloc(4);
            let buf2 = Buffer.from(data);

            buf1.writeUInt16LE(TypeID, 0);
            buf1.writeUInt16LE(buf2.length, 2);

            buf = buf2.length > 0 ? Buffer.concat([buf, buf1, buf2]) : Buffer.concat([buf, buf1]);
        }

        return buf;
    };

    /**
     * Parses Incoming Common Packet Formatted Buffer
     * and returns an Array of Objects.
     *
     * @param {Buffer} buf - Common Packet Formatted Data Buffer
     * @returns {Array} Array of Common Packet Data Objects
     */
    export function parse(buf: Buffer): Array<{TypeID: number, length: number, data: Buffer}> {
        const itemCount = buf.readUInt16LE(0);

        let ptr = 2;
        let arr = [];

        for (let i = 0; i < itemCount; i++) {
            // Get Type ID
            const TypeID = buf.readUInt16LE(ptr);
            ptr += 2;

            // Get Data Length
            const length = buf.readUInt16LE(ptr);
            ptr += 2;

            // Get Data from Data Buffer
            const data = Buffer.alloc(length);
            buf.copy(data, 0, ptr, ptr + length);

            // Append Gathered Data Object to Return Array
            arr.push({ TypeID, length, data});

            ptr += length;
        }

        return arr;
    };
}

export namespace header
{
    export function build(cmd: number, session = 0x00, data: Buffer | Array<number> = [])
    {
        // Validate requested command
        if (!validateCommand(cmd)) throw new Error("Invalid Encapsulation Command!");
    
        const buf = Buffer.from(data);
        const send = {
            cmd: cmd,
            length: buf.length,
            session: session,
            status: 0x00,
            context: Buffer.alloc(8, 0x00),
            options: 0x00,
            data: buf
        };
    
        // Initialize header buffer to appropriate length
        let header = Buffer.alloc(24 + send.length);
    
        // Build header from encapsulation data
        header.writeUInt16LE(send.cmd, 0);
        header.writeUInt16LE(send.length, 2);
        header.writeUInt32LE(send.session, 4);
        header.writeUInt32LE(send.status, 8);
        send.context.copy(header, 12);
        header.writeUInt32LE(send.options, 20);
        send.data.copy(header, 24);
    
        return header;
    }

    export function parse(buf: Buffer)
    {
        if (!Buffer.isBuffer(buf)) throw new Error("header.parse accepts type <Buffer> only!");
    
        const received = {
            commandCode: buf.readUInt16LE(0),
            command: '',
            length: buf.readUInt16LE(2),
            session: buf.readUInt32LE(4),
            statusCode: buf.readUInt32LE(8),
            status: '',
            options: buf.readUInt32LE(20),
            data: Buffer.alloc(0)
        };
    
        // Get Returned Encapsulated Data
        let dataBuffer = Buffer.alloc(received.length);
        buf.copy(dataBuffer, 0, 24);
    
        received.data = dataBuffer;
        received.status = parseStatus(received.statusCode);
        received.command = commands[received.commandCode];
    
        return received;
    };
}

export function registerSession(): Buffer{
    const { RegisterSession } = commands;
    const cmdBuf = Buffer.alloc(4);
    cmdBuf.writeUInt16LE(0x01, 0); // Protocol Version (Required to be 1)
    cmdBuf.writeUInt16LE(0x00, 2); // Opton Flags (Reserved for Future List)

    // Build Register Session Buffer and return it
    return header.build(commands.RegisterSession, 0x00, cmdBuf);
};

/**
 * Returns an Unregister Session Request String
 */
export function unregisterSession(session: number): Buffer {
    return header.build(commands.UnregisterSession, session);
};

/**
 * Returns a UCMM Encapsulated Packet String
 */
export function sendRRData(session: number, data: Buffer, timeout = 10): Buffer {
    const { SendRRData } = commands;

    let timeoutBuf = Buffer.alloc(6);
    timeoutBuf.writeUInt32LE(0x00, 0); // Interface Handle ID (Shall be 0 for CIP)
    timeoutBuf.writeUInt16LE(timeout, 4); // Timeout (sec)

    // Enclose in Common Packet Format
    let buf = CPF.build([
        { TypeID: CPF.ItemIDs.Null, data: Buffer.from([]) },
        { TypeID: CPF.ItemIDs.UCMM, data: data }
    ]);

    // Join Timeout Data with
    buf = Buffer.concat([timeoutBuf, buf]);

    // Build SendRRData Buffer
    return header.build(SendRRData, session, buf);
};

/**
 * Returns a Connected Message Datagram (Transport Class 3) String
 */
export function sendUnitData(session: number, data: Buffer, ConnectionID: number, SequenceNumber: number): Buffer{
    const { SendUnitData } = commands;

    let timeoutBuf = Buffer.alloc(6);
    timeoutBuf.writeUInt32LE(0x00, 0); // Interface Handle ID (Shall be 0 for CIP)
    timeoutBuf.writeUInt16LE(0x00, 4); // Timeout (sec) (Shall be 0 for Connected Messages)

    // Enclose in Common Packet Format
    const seqAddrBuf = Buffer.alloc(4);
    seqAddrBuf.writeUInt32LE(ConnectionID, 0);
    const seqNumberBuf = Buffer.alloc(2);
    seqNumberBuf.writeUInt16LE(SequenceNumber, 0);
    const ndata = Buffer.concat([
        seqNumberBuf,
        data
    ]);

    let buf = CPF.build([
        {
            TypeID: CPF.ItemIDs.ConnectionBased,
            data: seqAddrBuf
        },
        {
            TypeID: CPF.ItemIDs.ConnectedTransportPacket,
            data: ndata
        }
    ]);

    // Join Timeout Data with
    buf = Buffer.concat([timeoutBuf, buf]);

    // Build SendRRData Buffer
    return header.build(SendUnitData, session, buf);
};