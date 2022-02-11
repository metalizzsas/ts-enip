"use strict";
var dataTypes;
(function (dataTypes) {
    let Types;
    (function (Types) {
        Types[Types["BOOL"] = 193] = "BOOL";
        Types[Types["SINT"] = 194] = "SINT";
        Types[Types["INT"] = 195] = "INT";
        Types[Types["DINT"] = 196] = "DINT";
        Types[Types["LINT"] = 197] = "LINT";
        Types[Types["USINT"] = 198] = "USINT";
        Types[Types["UINT"] = 199] = "UINT";
        Types[Types["UDINT"] = 200] = "UDINT";
        Types[Types["REAL"] = 202] = "REAL";
        Types[Types["LREAL"] = 203] = "LREAL";
        Types[Types["STIME"] = 204] = "STIME";
        Types[Types["DATE"] = 205] = "DATE";
        Types[Types["TIME_AND_DAY"] = 206] = "TIME_AND_DAY";
        Types[Types["DATE_AND_STRING"] = 207] = "DATE_AND_STRING";
        Types[Types["STRING"] = 208] = "STRING";
        Types[Types["WORD"] = 209] = "WORD";
        Types[Types["DWORD"] = 210] = "DWORD";
        Types[Types["BIT_STRING"] = 211] = "BIT_STRING";
        Types[Types["LWORD"] = 212] = "LWORD";
        Types[Types["STRING2"] = 213] = "STRING2";
        Types[Types["FTIME"] = 214] = "FTIME";
        Types[Types["LTIME"] = 215] = "LTIME";
        Types[Types["ITIME"] = 216] = "ITIME";
        Types[Types["STRINGN"] = 217] = "STRINGN";
        Types[Types["SHORT_STRING"] = 218] = "SHORT_STRING";
        Types[Types["TIME"] = 219] = "TIME";
        Types[Types["EPATH"] = 220] = "EPATH";
        Types[Types["ENGUNIT"] = 221] = "ENGUNIT";
        Types[Types["STRINGI"] = 222] = "STRINGI";
        Types[Types["STRUCT"] = 672] = "STRUCT";
    })(Types = dataTypes.Types || (dataTypes.Types = {}));
    ;
    /**
     * Checks if an Inputted Integer is a Valid Type Code (Vol1 Appendix C)
     */
    function isValidTypeCode(num) {
        return Object.values(Types).includes(num);
    }
    dataTypes.isValidTypeCode = isValidTypeCode;
    ;
    /**
     * Retrieves Human Readable Version of an Inputted Type Code
     */
    function getTypeCodeString(num) {
        return Types[num] ?? null;
    }
    dataTypes.getTypeCodeString = getTypeCodeString;
    ;
})(dataTypes || (dataTypes = {}));
