/// <reference types="node" />
declare const PORT_SEGMENT: number;
declare namespace Epath.port {
    /** Builds Port Segement for EPATH */
    function build(port: number, link: number | string): Buffer;
}
