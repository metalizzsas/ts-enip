/// <reference types="node" />
declare namespace Epath.logical {
    enum Types {
        ClassID = 0,
        InstanceID = 4,
        MemberID = 8,
        ConnPoint = 12,
        AttributeID = 16,
        Special = 20,
        ServiceID = 24
    }
    /**
     * Determines the Validity of the Type Code
     *
     * @param {number} type - Logical Segment Type Code
     * @returns {boolean}
     */
    function validateLogicalType(type: number): boolean;
    /**
     * Builds Single Logical Segment Buffer
     *
     * @param {number} type - Valid Logical Segment Type
     * @param {number} address - Logical Segment Address
     * @param {boolean} [padded=true] - Padded or Packed EPATH format
     * @returns {buffer}
     */
    function build(type: number, address: number, padded?: boolean): Buffer;
}
