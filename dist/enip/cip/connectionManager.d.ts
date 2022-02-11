/// <reference types="node" />
export declare namespace ConnectionManager {
    type UCMMSendTimeout = {
        time_tick: number;
        ticks: number;
    };
    /** lookup for the Redundant Owner (Vol.1 - Table 3-5.8 Field 15) */
    enum Owner {
        Exclusive = 0,
        Multiple = 1
    }
    /** lookup for the Connection Type (Vol.1 - Table 3-5.8 Field 14,13) */
    enum ConnectionType {
        Null = 0,
        Multicast = 1,
        PointToPoint = 2,
        Reserved = 3
    }
    /** lookup for the Connection Priority (Vol.1 - Table 3-5.8 Field 11,10) */
    enum Priority {
        Low = 0,
        High = 1,
        Scheduled = 2,
        Urgent = 3
    }
    /** lookup for the fixed or variable parameter (Vol.1 - Table 3-5.8 Field 9) */
    enum FixedVar {
        Fixed = 0,
        Variable = 1
    }
    /**
     * Build for Object specific connection parameters (Vol.1 - Table 3-5.8)
     */
    function build_connectionParameters(owner: Owner, type: ConnectionType, priority: Priority, fixedVar: FixedVar, size: number): number;
    /**
     * Gets the Best Available Timeout Values
     *
     * @param {number} timeout - Desired Timeout in ms
     * @returns {UCMMSendTimeout}
     */
    function generateEncodedTimeout(timeout: number): UCMMSendTimeout;
    /**
     * Builds the data portion of a forwardOpen packet
     *
     * @param {number} [timeOutMs=500] - How many ticks until a timeout is thrown
     * @param {number} [timeOutMult=32] - A multiplier used for the Timeout
     * @param {number} [otRPI=8000] - O->T Request packet interval in milliseconds.
     * @param {number} [serialOrig=0x1337] - Originator Serial Number (SerNo of the PLC)
     * @returns {Buffer} data portion of the forwardOpen packet
     */
    function build_forwardOpen(otRPI?: number, netConnParams?: number, timeOutMs?: number, timeOutMult?: number, connectionSerial?: number): Buffer;
    /**
     * Builds the data portion of a forwardClose packet
     *
     * @param {number} [timeOutMs=501] - How many ms until a timeout is thrown
     * @param {number} [vendorOrig=0x3333] - Originator vendorID (Vendor of the PLC)
     * @param {number} [serialOrig=0x1337] - Originator Serial Number (SerNo of the PLC)
     * @returns {Buffer} data portion of the forwardClose packet
     */
    function build_forwardClose(timeOutMs?: number, vendorOrig?: number, serialOrig?: number, connectionSerial?: number): Buffer;
}
