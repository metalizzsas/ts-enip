"use strict";
var epath;
(function (epath) {
    var data;
    (function (data_1) {
        let Types;
        (function (Types) {
            Types[Types["Simple"] = 128] = "Simple";
            Types[Types["ANSI_EXTD"] = 145] = "ANSI_EXTD";
        })(Types = data_1.Types || (data_1.Types = {}));
        ;
        let ElementTypes;
        (function (ElementTypes) {
            ElementTypes[ElementTypes["UINT8"] = 40] = "UINT8";
            ElementTypes[ElementTypes["UINT16"] = 41] = "UINT16";
            ElementTypes[ElementTypes["UINT32"] = 42] = "UINT32";
        })(ElementTypes = data_1.ElementTypes || (data_1.ElementTypes = {}));
        ;
        /**
         * Builds EPATH Data Segment
         *
         * @param {string|buffer} data
         * @param {boolean} [ANSI=true] Declare if ANSI Extended or Simple
         * @returns {buffer}
         */
        function build(data, ANSI = true) {
            // Build Element Segment If Int
            if (typeof data === 'string')
                return elementBuild(parseInt(data));
            // Build symbolic segment by default
            return symbolicBuild(data, ANSI);
        }
        data_1.build = build;
        ;
        /**
         * Builds EPATH Symbolic Segment
         *
         * @param {string|buffer} data
         * @param {boolean} [ANSI=true] Declare if ANSI Extended or Simple
         * @returns {buffer}
         */
        function symbolicBuild(data, ANSI = true) {
            // Initialize Buffer
            let buf = Buffer.alloc(2);
            // Write Appropriate Segment Byte
            buf.writeUInt8(ANSI ? Types.ANSI_EXTD : Types.Simple, 0);
            // Write Appropriate Length
            buf.writeUInt8(ANSI ? data.length : Math.ceil(data.length / 2), 1);
            // Append Data
            buf = Buffer.concat([buf, Buffer.from(data)]);
            // Add Pad Byte if Odd Length
            if (buf.length % 2 === 1)
                buf = Buffer.concat([buf, Buffer.alloc(1)]); // Pad Odd Length Strings
            return buf;
        }
        data_1.symbolicBuild = symbolicBuild;
        ;
        /**
         * Builds EPATH Element Segment
         *
         * @param {string} data
         * @returns {buffer}
         */
        function elementBuild(data) {
            // Get Element Length - Data Access 2 - IOI Segments - Element Segments
            let type;
            let dataBuf;
            if (data < 256) {
                type = ElementTypes.UINT8; // UNIT8 x28 xx
                dataBuf = Buffer.alloc(1);
                dataBuf.writeUInt8(data);
            }
            else if (data < 65536) {
                type = ElementTypes.UINT16; // UINT16 x29 00 xx xx
                dataBuf = Buffer.alloc(3);
                dataBuf.writeUInt16LE(data, 1);
            }
            else {
                type = ElementTypes.UINT32; // UINT32 x2a 00 xx xx xx xx
                dataBuf = Buffer.alloc(5);
                dataBuf.writeUInt32LE(data, 1);
            }
            // Initialize Buffer
            let buf = Buffer.alloc(1);
            // Write Appropriate Segment Byte
            buf.writeUInt8(type, 0);
            // Append Data
            buf = Buffer.concat([buf, dataBuf]);
            return buf;
        }
        data_1.elementBuild = elementBuild;
    })(data = epath.data || (epath.data = {}));
})(epath || (epath = {}));
