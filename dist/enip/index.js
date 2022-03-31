"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENIP = void 0;
const net_1 = require("net");
const stream_1 = require("stream");
const encapsulation_1 = require("./encapsulation");
var ENIP;
(function (ENIP) {
    let States;
    (function (States) {
        States["UNCONNECTED"] = "unconnected";
        States["ESTABLISHED"] = "established";
        States["ESTABLISHING"] = "establishing";
    })(States || (States = {}));
    const EIP_PORT = 44818;
    /**
     * Low Level Ethernet/IP
     */
    class SocketController {
        state = {
            TCPState: States.UNCONNECTED,
            session: { id: 0, state: States.UNCONNECTED },
            connection: { id: 0, state: States.UNCONNECTED, seq_num: 0 },
            error: { code: 0, msg: '' }
        };
        socket;
        events;
        constructor() {
            this.socket = new net_1.Socket();
            this.events = new stream_1.EventEmitter();
        }
        /**
         * Initializes Session with Desired IP Address or FQDN
         * and Returns a Promise with the Established Session ID
         */
        async connect(IP_ADDR, timeoutSP = 10000) {
            this.state.session.state = States.ESTABLISHING;
            this.state.TCPState = States.ESTABLISHING;
            /**
             * Connects to the controller using a raw TCP Socket
             * and register ourselves using RegisterSession Method
             */
            const connectResult = await new Promise((resolve) => {
                this.socket.connect(EIP_PORT, IP_ADDR);
                this.socket.once("connect", () => {
                    this.state.TCPState = States.ESTABLISHED;
                    resolve(true);
                });
                this.socket.once("error", () => () => {
                    resolve(false);
                    this.state.TCPState = States.UNCONNECTED;
                });
            });
            //@ts-ignore
            if (connectResult === true && this.state.TCPState === States.ESTABLISHED) {
                //Adding Sockets events
                this.socket.on("data", (data) => { this.handleData(data); });
                this.socket.once("close", (hadError) => { this.handleClose(hadError); this.events.emit("close"); });
                this.socket.write(encapsulation_1.Encapsulation.registerSession());
                const sessionID = await new Promise((resolve) => {
                    setTimeout(() => resolve(undefined), timeoutSP);
                    this.events.on("Session Registered", (sessionid) => {
                        this.state.session.state = States.ESTABLISHED;
                        resolve(sessionid);
                    });
                    this.events.on("Session Registration Failed", error => {
                        this.state.error.code = error.code;
                        this.state.error.msg = "Failed to register Session";
                        resolve(undefined);
                    });
                });
                this.events.removeAllListeners("Session Registered");
                this.events.removeAllListeners("Session Registration Failed");
                return sessionID;
            }
            else {
                this.state.TCPState = States.UNCONNECTED;
                this.state.session.state = States.UNCONNECTED;
                this.state.error.msg = "Failed to connect to socket";
                return 0;
            }
        }
        /**
         * Writes Ethernet/IP Data to Socket as an Unconnected Message
         * or a Transport Class 1 Datagram
         */
        async write(data, connected = false, timeout) {
            if (this.state.session.state = States.ESTABLISHED) {
                if (connected === true) {
                    if (this.state.connection.state === States.ESTABLISHED) {
                        (this.state.connection.seq_num > 0xffff) ? this.state.connection.seq_num = 0 : this.state.connection.seq_num++;
                    }
                    else {
                        throw new Error("Connected message request, but no connection established. Forgot forwardOpen?");
                    }
                }
                if (this.state.session.id) {
                    //If the packet should be connected, send UnitData otherwise send RRData
                    const packet = (connected) ? encapsulation_1.Encapsulation.sendUnitData(this.state.session.id, data, this.state.connection.id, this.state.connection.seq_num) : encapsulation_1.Encapsulation.sendRRData(this.state.session.id, data, timeout ?? 10);
                    const write = await new Promise((resolve, reject) => {
                        this.socket.write(packet, (err) => {
                            //timeout rejection
                            setTimeout(() => reject(false), timeout ?? 10000);
                            resolve(err === undefined ? true : false);
                        });
                    });
                    return write;
                }
                else {
                    console.log("ts-enip: Session not registered");
                    return false;
                }
            }
            else {
                return false;
            }
        }
        /**
         * Sends Unregister Session Command and Destroys Underlying TCP Socket
         * @deprecated
         */
        destroy(_error) {
            if (this.state.session.id != 0 && this.state.session.state === States.ESTABLISHED && this.state.TCPState !== States.UNCONNECTED) {
                this.socket.write(encapsulation_1.Encapsulation.unregisterSession(this.state.session.id), (_err) => {
                    this.state.session.state = States.UNCONNECTED;
                });
            }
        }
        /**
         * Sends an UnregisterSession command
         */
        close() {
            if (this.state.session.id != 0 && this.state.session.state === States.ESTABLISHED && this.state.TCPState !== States.UNCONNECTED) {
                this.socket.write(encapsulation_1.Encapsulation.unregisterSession(this.state.session.id));
            }
        }
        /**
         * Socket data event handler
         */
        handleData(data) {
            const encapsulatedData = encapsulation_1.Encapsulation.Header.parse(data);
            const { statusCode, status, commandCode } = encapsulatedData;
            if (statusCode !== 0) {
                console.log(`Error <${statusCode}>: `, status);
                this.state.error.code = statusCode;
                this.state.error.msg = status;
                this.events.emit("Session Registration Failed", this.state.error);
            }
            else {
                this.state.error.code = 0;
                this.state.error.msg = '';
                switch (commandCode) {
                    case encapsulation_1.Encapsulation.Commands.RegisterSession: {
                        this.state.session.state = States.ESTABLISHED;
                        this.state.session.id = encapsulatedData.session;
                        this.events.emit("Session Registered", this.state.session.id);
                        break;
                    }
                    case encapsulation_1.Encapsulation.Commands.UnregisterSession: {
                        this.state.session.state = States.UNCONNECTED;
                        this.events.emit("Session Unregistered");
                        break;
                    }
                    case encapsulation_1.Encapsulation.Commands.SendRRData: {
                        let buf1 = Buffer.alloc(encapsulatedData.length - 6); // length of Data - Interface Handle <UDINT> and Timeout <UINT>
                        encapsulatedData.data.copy(buf1, 0, 6);
                        const srrd = encapsulation_1.Encapsulation.CPF.parse(buf1);
                        this.events.emit("SendRRData Received", srrd);
                        break;
                    }
                    case encapsulation_1.Encapsulation.Commands.SendUnitData: {
                        let buf2 = Buffer.alloc(encapsulatedData.length - 6); // length of Data - Interface Handle <UDINT> and Timeout <UINT>
                        encapsulatedData.data.copy(buf2, 0, 6);
                        const sud = encapsulation_1.Encapsulation.CPF.parse(buf2);
                        this.events.emit("SendUnitData Received", sud);
                        break;
                    }
                    default:
                        this.events.emit("Unhandled Encapsulated Command Received", encapsulatedData);
                }
            }
        }
        /**
         * Handle socket close
         */
        handleClose(_hadError) {
            this.state.session.state = States.UNCONNECTED;
            this.state.TCPState = States.UNCONNECTED;
            this.socket.removeAllListeners("data");
            this.socket.removeAllListeners("close");
            this.socket.removeAllListeners("error");
        }
    }
    ENIP.SocketController = SocketController;
})(ENIP = exports.ENIP || (exports.ENIP = {}));
