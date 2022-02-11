"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Epath = void 0;
const PORT = require("./port");
const LOGICAL = require("./logical");
const DATA = require("./data");
var Epath;
(function (Epath) {
    let SegmentTypes;
    (function (SegmentTypes) {
        SegmentTypes[SegmentTypes["PORT"] = 0] = "PORT";
        SegmentTypes[SegmentTypes["LOGICAL"] = 32] = "LOGICAL";
        SegmentTypes[SegmentTypes["NETWORK"] = 64] = "NETWORK";
        SegmentTypes[SegmentTypes["SYMBOLIC"] = 96] = "SYMBOLIC";
        SegmentTypes[SegmentTypes["DATA"] = 128] = "DATA";
        SegmentTypes[SegmentTypes["DATATYPE_1"] = 160] = "DATATYPE_1";
        SegmentTypes[SegmentTypes["DATATYPE_2"] = 384] = "DATATYPE_2";
    })(SegmentTypes = Epath.SegmentTypes || (Epath.SegmentTypes = {}));
})(Epath = exports.Epath || (exports.Epath = {}));
