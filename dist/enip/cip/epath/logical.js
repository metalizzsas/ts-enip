"use strict";
var Epath;
(function (Epath) {
    var logical;
    (function (logical) {
        const LOGICAL_SEGMENT = 1 << 5;
        let Types;
        (function (Types) {
            Types[Types["ClassID"] = 0] = "ClassID";
            Types[Types["InstanceID"] = 4] = "InstanceID";
            Types[Types["MemberID"] = 8] = "MemberID";
            Types[Types["ConnPoint"] = 12] = "ConnPoint";
            Types[Types["AttributeID"] = 16] = "AttributeID";
            Types[Types["Special"] = 20] = "Special";
            Types[Types["ServiceID"] = 24] = "ServiceID";
        })(Types = logical.Types || (logical.Types = {}));
        ;
        /**
         * Determines the Validity of the Type Code
         *
         * @param {number} type - Logical Segment Type Code
         * @returns {boolean}
         */
        function validateLogicalType(type) {
            return Object.values(Types).includes(type);
        }
        logical.validateLogicalType = validateLogicalType;
        ;
        /**
         * Builds Single Logical Segment Buffer
         *
         * @param {number} type - Valid Logical Segment Type
         * @param {number} address - Logical Segment Address
         * @param {boolean} [padded=true] - Padded or Packed EPATH format
         * @returns {buffer}
         */
        function build(type, address, padded = true) {
            if (!validateLogicalType(type))
                throw new Error("Invalid Logical Type Code Passed to Segment Builder");
            if (typeof address !== "number" || address <= 0)
                throw new Error("Passed Address Must be a Positive Integer");
            let buf = null; // Initialize Output Buffer
            // Determine Size of Logical Segment Value and Build Buffer
            let format = null;
            if (address <= 255) {
                format = 0;
                buf = Buffer.alloc(2);
                buf.writeUInt8(address, 1);
            }
            else if (address > 255 && address <= 65535) {
                format = 1;
                if (padded) {
                    buf = Buffer.alloc(4);
                    buf.writeUInt16LE(address, 2);
                }
                else {
                    buf = Buffer.alloc(3);
                    buf.writeUInt16LE(address, 1);
                }
            }
            else {
                format = 2;
                if (padded) {
                    buf = Buffer.alloc(6);
                    buf.writeUInt32LE(address, 2);
                }
                else {
                    buf = Buffer.alloc(5);
                    buf.writeUInt32LE(address, 1);
                }
            }
            // Build Segment Byte
            const segmentByte = LOGICAL_SEGMENT | type | format;
            buf.writeUInt8(segmentByte, 0);
            return buf;
        }
        logical.build = build;
    })(logical = Epath.logical || (Epath.logical = {}));
})(Epath || (Epath = {}));
