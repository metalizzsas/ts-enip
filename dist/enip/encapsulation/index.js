"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUnitData = exports.sendRRData = exports.unregisterSession = exports.registerSession = exports.header = exports.CPF = exports.parseStatus = exports.commands = void 0;
var commands;
(function (commands) {
    commands[commands["NOP"] = 0] = "NOP";
    commands[commands["ListServices"] = 4] = "ListServices";
    commands[commands["ListIdentity"] = 99] = "ListIdentity";
    commands[commands["ListInterfaces"] = 100] = "ListInterfaces";
    commands[commands["RegisterSession"] = 101] = "RegisterSession";
    commands[commands["UnregisterSession"] = 102] = "UnregisterSession";
    commands[commands["SendRRData"] = 111] = "SendRRData";
    commands[commands["SendUnitData"] = 112] = "SendUnitData";
    commands[commands["IndicateStatus"] = 114] = "IndicateStatus";
    commands[commands["Cancel"] = 115] = "Cancel";
})(commands = exports.commands || (exports.commands = {}));
;
// region Validation Helper Functions
/**
 * Parses Encapulation Status Code to Human Readable Error Message.
 *
 * @param {number} status - Status Code
 * @returns {string} Human Readable Error Message
 */
function parseStatus(status) {
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
}
exports.parseStatus = parseStatus;
;
/**
 * Checks if Command is a Valid Encapsulation Command
 *
 * @param {Number} ecapsulation command
 * @returns {boolean} test result
 */
function validateCommand(cmd) {
    return Object.values(commands).includes(cmd);
}
;
// endregion
// region Compact Packet Format
var CPF;
(function (CPF) {
    CPF.ItemIDs = {
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
    function isCmd(cmd) {
        for (let key of Object.keys(CPF.ItemIDs)) {
            if (cmd === CPF.ItemIDs[key])
                return true;
        }
        return false;
    }
    CPF.isCmd = isCmd;
    /**
     * Builds a Common Packet Formatted Buffer to be
     * Encapsulated.
     *
     * @param {Array} dataItems - Array of CPF Data Items
     * @returns {Buffer} CPF Buffer to be Encapsulated
     */
    function build(dataItems) {
        // Write Item Count and Initialize Buffer
        let buf = Buffer.alloc(2);
        buf.writeUInt16LE(dataItems.length, 0);
        for (let item of dataItems) {
            const { TypeID, data } = item;
            if (!isCmd(TypeID))
                throw new Error("Invalid CPF Type ID!");
            let buf1 = Buffer.alloc(4);
            let buf2 = Buffer.from(data);
            buf1.writeUInt16LE(TypeID, 0);
            buf1.writeUInt16LE(buf2.length, 2);
            buf = buf2.length > 0 ? Buffer.concat([buf, buf1, buf2]) : Buffer.concat([buf, buf1]);
        }
        return buf;
    }
    CPF.build = build;
    ;
    /**
     * Parses Incoming Common Packet Formatted Buffer
     * and returns an Array of Objects.
     *
     * @param {Buffer} buf - Common Packet Formatted Data Buffer
     * @returns {Array} Array of Common Packet Data Objects
     */
    function parse(buf) {
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
            arr.push({ TypeID, length, data });
            ptr += length;
        }
        return arr;
    }
    CPF.parse = parse;
    ;
})(CPF = exports.CPF || (exports.CPF = {}));
var header;
(function (header_1) {
    function build(cmd, session = 0x00, data = []) {
        // Validate requested command
        if (!validateCommand(cmd))
            throw new Error("Invalid Encapsulation Command!");
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
    header_1.build = build;
    function parse(buf) {
        if (!Buffer.isBuffer(buf))
            throw new Error("header.parse accepts type <Buffer> only!");
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
    }
    header_1.parse = parse;
    ;
})(header = exports.header || (exports.header = {}));
function registerSession() {
    const { RegisterSession } = commands;
    const cmdBuf = Buffer.alloc(4);
    cmdBuf.writeUInt16LE(0x01, 0); // Protocol Version (Required to be 1)
    cmdBuf.writeUInt16LE(0x00, 2); // Opton Flags (Reserved for Future List)
    // Build Register Session Buffer and return it
    return header.build(commands.RegisterSession, 0x00, cmdBuf);
}
exports.registerSession = registerSession;
;
/**
 * Returns an Unregister Session Request String
 */
function unregisterSession(session) {
    return header.build(commands.UnregisterSession, session);
}
exports.unregisterSession = unregisterSession;
;
/**
 * Returns a UCMM Encapsulated Packet String
 */
function sendRRData(session, data, timeout = 10) {
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
}
exports.sendRRData = sendRRData;
;
/**
 * Returns a Connected Message Datagram (Transport Class 3) String
 */
function sendUnitData(session, data, ConnectionID, SequenceNumber) {
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
}
exports.sendUnitData = sendUnitData;
;
