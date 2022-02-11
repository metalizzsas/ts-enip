/// <reference types="node" />
export declare namespace MessageRouter {
    /**
     * Message router services
     */
    enum services {
        GET_INSTANCE_ATTRIBUTE_LIST = 85,
        GET_ATTRIBUTES = 3,
        GET_ATTRIBUTE_ALL = 1,
        GET_ATTRIBUTE_SINGLE = 14,
        RESET = 5,
        START = 6,
        STOP = 7,
        CREATE = 8,
        DELETE = 9,
        MULTIPLE_SERVICE_PACKET = 10,
        APPLY_ATTRIBUTES = 13,
        SET_ATTRIBUTE_SINGLE = 16,
        FIND_NEXT = 17,
        READ_TAG = 76,
        WRITE_TAG = 77,
        READ_TAG_FRAGMENTED = 82,
        WRITE_TAG_FRAGMENTED = 83,
        READ_MODIFY_WRITE_TAG = 78,
        FORWARD_OPEN = 84,
        FORWARD_CLOSE = 78
    }
    type MessageRouter = {
        service: number;
        generalStatusCode: number;
        extendedStatusLength: number;
        extendedStatus: number[] | null;
        data: Buffer | null;
    };
    /**
     * Builds a Message Router Request Buffer
     */
    function build(service: number, path: Buffer, data: Buffer): Buffer;
    /**
     * Parses a Message Router Request Buffer
     */
    function parse(buf: Buffer): MessageRouter;
}
