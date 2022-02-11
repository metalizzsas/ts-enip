/// <reference types="node" />
declare namespace epath.data {
    enum Types {
        Simple = 128,
        ANSI_EXTD = 145
    }
    enum ElementTypes {
        UINT8 = 40,
        UINT16 = 41,
        UINT32 = 42
    }
    /**
     * Builds EPATH Data Segment
     *
     * @param {string|buffer} data
     * @param {boolean} [ANSI=true] Declare if ANSI Extended or Simple
     * @returns {buffer}
     */
    function build(data: string | Buffer, ANSI?: boolean): Buffer;
    /**
     * Builds EPATH Symbolic Segment
     *
     * @param {string|buffer} data
     * @param {boolean} [ANSI=true] Declare if ANSI Extended or Simple
     * @returns {buffer}
     */
    function symbolicBuild(data: string | Buffer, ANSI?: boolean): Buffer;
    /**
     * Builds EPATH Element Segment
     *
     * @param {string} data
     * @returns {buffer}
     */
    function elementBuild(data: number): Buffer;
}
