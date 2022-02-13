# ts-enip – TypeScript EtherNet/IP™

TypeScript implementation of the Ethernet/IP™ protocol.

Based on the work of [cmseaton42/node-ethernet-ip](https://github.com/cmseaton42/node-ethernet-ip) and [SerafinTech/ST-node-ethernet-ip](https://github.com/SerafinTech/ST-node-ethernet-ip)

This implementation is less complete but more stable and readable.
We use this implementation as a part of a private project.

## Building

Run NPM to build this package.

`npm run build`

## Using the library

this packet is not published to npm library for now. But you can add this packet to your package.json by adding this line:

```json
"ts-enip": "git+https://github.com/metalizzsas/ts-enip.git#build"
```

Using this packet is more complex but more versatile as you can write raw packets to the socket.

```javascript
import {ENIP} from "ts-enip";

const enip = new ENIP.SocketController();

const sessionID = await enip.connect("IP_ADDRESS");

if(sessionID)
{
    /**
     * Defined your ethernet ip packet here
     * You can used bundled tools like Encapsulation.CPF
     */ 
    const packet: Buffer = Buffer.alloc(0);
    enip.write(packet);
}
```
