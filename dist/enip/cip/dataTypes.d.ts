declare namespace dataTypes {
    enum Types {
        BOOL = 193,
        SINT = 194,
        INT = 195,
        DINT = 196,
        LINT = 197,
        USINT = 198,
        UINT = 199,
        UDINT = 200,
        REAL = 202,
        LREAL = 203,
        STIME = 204,
        DATE = 205,
        TIME_AND_DAY = 206,
        DATE_AND_STRING = 207,
        STRING = 208,
        WORD = 209,
        DWORD = 210,
        BIT_STRING = 211,
        LWORD = 212,
        STRING2 = 213,
        FTIME = 214,
        LTIME = 215,
        ITIME = 216,
        STRINGN = 217,
        SHORT_STRING = 218,
        TIME = 219,
        EPATH = 220,
        ENGUNIT = 221,
        STRINGI = 222,
        STRUCT = 672
    }
    /**
     * Checks if an Inputted Integer is a Valid Type Code (Vol1 Appendix C)
     */
    function isValidTypeCode(num: number): boolean;
    /**
     * Retrieves Human Readable Version of an Inputted Type Code
     */
    function getTypeCodeString(num: number): string | null;
}
