"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRouter = void 0;
var MessageRouter;
(function (MessageRouter) {
    /**
     * Message router services
     */
    let services;
    (function (services) {
        services[services["GET_INSTANCE_ATTRIBUTE_LIST"] = 85] = "GET_INSTANCE_ATTRIBUTE_LIST";
        services[services["GET_ATTRIBUTES"] = 3] = "GET_ATTRIBUTES";
        services[services["GET_ATTRIBUTE_ALL"] = 1] = "GET_ATTRIBUTE_ALL";
        services[services["GET_ATTRIBUTE_SINGLE"] = 14] = "GET_ATTRIBUTE_SINGLE";
        services[services["RESET"] = 5] = "RESET";
        services[services["START"] = 6] = "START";
        services[services["STOP"] = 7] = "STOP";
        services[services["CREATE"] = 8] = "CREATE";
        services[services["DELETE"] = 9] = "DELETE";
        services[services["MULTIPLE_SERVICE_PACKET"] = 10] = "MULTIPLE_SERVICE_PACKET";
        services[services["APPLY_ATTRIBUTES"] = 13] = "APPLY_ATTRIBUTES";
        services[services["SET_ATTRIBUTE_SINGLE"] = 16] = "SET_ATTRIBUTE_SINGLE";
        services[services["FIND_NEXT"] = 17] = "FIND_NEXT";
        services[services["READ_TAG"] = 76] = "READ_TAG";
        services[services["WRITE_TAG"] = 77] = "WRITE_TAG";
        services[services["READ_TAG_FRAGMENTED"] = 82] = "READ_TAG_FRAGMENTED";
        services[services["WRITE_TAG_FRAGMENTED"] = 83] = "WRITE_TAG_FRAGMENTED";
        services[services["READ_MODIFY_WRITE_TAG"] = 78] = "READ_MODIFY_WRITE_TAG";
        services[services["FORWARD_OPEN"] = 84] = "FORWARD_OPEN";
        services[services["FORWARD_CLOSE"] = 78] = "FORWARD_CLOSE";
    })(services = MessageRouter.services || (MessageRouter.services = {}));
    ;
    /**
     * Builds a Message Router Request Buffer
     */
    function build(service, path, data) {
        const pathBuf = Buffer.from(path);
        const dataBuf = Buffer.from(data);
        const pathLen = Math.ceil(pathBuf.length / 2);
        const buf = Buffer.alloc(2 + pathLen * 2 + dataBuf.length);
        buf.writeUInt8(service, 0); // Write Service Code to Buffer <USINT>
        buf.writeUInt8(pathLen, 1); // Write Length of EPATH (16 bit word length)
        pathBuf.copy(buf, 2); // Write EPATH to Buffer
        dataBuf.copy(buf, 2 + pathLen * 2); // Write Service Data to Buffer
        return buf;
    }
    MessageRouter.build = build;
    ;
    /**
     * Parses a Message Router Request Buffer
     */
    function parse(buf) {
        let messageRouter = {
            service: buf.readUInt8(0),
            generalStatusCode: buf.readUInt8(2),
            extendedStatusLength: buf.readUInt8(3),
            extendedStatus: null,
            data: null
        };
        // Build Extended Status Array
        let arr = [];
        for (let i = 0; i < messageRouter.extendedStatusLength; i++) {
            arr.push(buf.readUInt16LE(i * 2 + 4));
        }
        messageRouter.extendedStatus = arr;
        // Get Starting Point of Message Router Data
        const dataStart = messageRouter.extendedStatusLength * 2 + 4;
        // Initialize Message Router Data Buffer
        let data = Buffer.alloc(buf.length - dataStart);
        // Copy Data to Message Router Data Buffer
        buf.copy(data, 0, dataStart);
        messageRouter.data = data;
        return messageRouter;
    }
    MessageRouter.parse = parse;
    ;
})(MessageRouter = exports.MessageRouter || (exports.MessageRouter = {}));
