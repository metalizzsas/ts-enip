"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encapsulation = void 0;
var Encapsulation;
(function (Encapsulation) {
    let Commands;
    (function (Commands) {
        Commands[Commands["NOP"] = 0] = "NOP";
        Commands[Commands["ListServices"] = 4] = "ListServices";
        Commands[Commands["ListIdentity"] = 99] = "ListIdentity";
        Commands[Commands["ListInterfaces"] = 100] = "ListInterfaces";
        Commands[Commands["RegisterSession"] = 101] = "RegisterSession";
        Commands[Commands["UnregisterSession"] = 102] = "UnregisterSession";
        Commands[Commands["SendRRData"] = 111] = "SendRRData";
        Commands[Commands["SendUnitData"] = 112] = "SendUnitData";
        Commands[Commands["IndicateStatus"] = 114] = "IndicateStatus";
        Commands[Commands["Cancel"] = 115] = "Cancel";
    })(Commands = Encapsulation.Commands || (Encapsulation.Commands = {}));
    ;
    /**
     * Parses Encapulation Status Code to Human Readable Error Message.
     * @param status Status Code
     * @returns Human Readable Error Message
     */
    function parseStatus(status) {
        switch (status) {
            case 0x00:
                return "SUCCESS";
            case 0x01:
                return "FAIL: Sender issued an invalid encapsulation command.";
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
    Encapsulation.parseStatus = parseStatus;
    ;
    /**
     * Checks if Command is a Valid Encapsulation Command
     * @param ecapsulation command
     * @returns test result
     */
    function validateCommand(cmd) {
        return Object.values(Commands).includes(cmd);
    }
    ;
    /** Compact Packet Format  */
    let CPF;
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
        /**
         * Checks if the specified command number is a known command
         * @param cmd Command number to check
         * @returns if the command is a known command
         */
        function isCmd(cmd) {
            return Object.values(CPF.ItemIDs).includes(cmd);
        }
        CPF.isCmd = isCmd;
        /**
         * Builds a Common Packet Formatted Buffer to be
         * Encapsulated.
         *
         * @param dataItems - Array of CPF Data Items
         * @returns CPF Buffer to be Encapsulated
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
         * @param buf - Common Packet Formatted Data Buffer
         * @returns Array of Common Packet Data Objects
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
    })(CPF = Encapsulation.CPF || (Encapsulation.CPF = {}));
    let Header;
    (function (Header) {
        /**
         *
         * @param cmd command number to use
         * @param session session id to use
         * @param data data buffer to send
         * @returns Encapsulated data
         */
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
        Header.build = build;
        ;
        /**
         * Parses an header
         * @param buf header to parse
         * @returns parsed header
         */
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
            received.command = Commands[received.commandCode];
            return received;
        }
        Header.parse = parse;
        ;
    })(Header = Encapsulation.Header || (Encapsulation.Header = {}));
    /**
     * Creates a register session packet
     * @returns register Session packet
     */
    function registerSession() {
        const cmdBuf = Buffer.alloc(4);
        cmdBuf.writeUInt16LE(0x01, 0); // Protocol Version (Required to be 1)
        cmdBuf.writeUInt16LE(0x00, 2); // Opton Flags (Reserved for Future List)
        // Build Register Session Buffer and return it
        return Header.build(Commands.RegisterSession, 0x00, cmdBuf);
    }
    Encapsulation.registerSession = registerSession;
    ;
    /**
     * Returns an Unregister Session Request Buffer
     * @returns unregister Session packet
     */
    function unregisterSession(session) {
        return Header.build(Commands.UnregisterSession, session);
    }
    Encapsulation.unregisterSession = unregisterSession;
    ;
    /**
     * Returns a UCMM Encapsulated Packet Buffer
     * @returns sendRRData packet
     */
    function sendRRData(session, data, timeout = 10) {
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
        return Header.build(Commands.SendRRData, session, buf);
    }
    Encapsulation.sendRRData = sendRRData;
    ;
    /**
     * Returns a Connected Message Datagram (Transport Class 3) String
     * @returns sendUnitData packet
     */
    function sendUnitData(session, data, ConnectionID, SequenceNumber) {
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
        return Header.build(Commands.SendUnitData, session, buf);
    }
    Encapsulation.sendUnitData = sendUnitData;
    ;
})(Encapsulation = exports.Encapsulation || (exports.Encapsulation = {}));
