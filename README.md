# Hello WebRTC

A simple js library to use WebRTC.

## install

```
npm install --save hello-webrtc
```

## usage

ES6:

```
import { WebRTCPeer, WebRTCClient } from 'hello-webrtc/src/hello-webrtc'
```

CommonJS:

```
const { WebRTCPeer, WebRTCClient } = require('hello-webrtc')
```

With Webpack:

```
import { WebRTCPeer, WebRTCClient } from 'hello-webrtc'
```

In browsers:

```
<script src="node_modules/hello-webrtc/dist/hello-webrtc.js"></script>
<script>
const { WebRTCPeer, WebRTCClient } = window.HelloWebRTC
</script>
```

To use:

```
let peer = new WebRTCPeer(options)
let client = new WebRTCClient(options)
```

## WebRTCPeer

### constructor(options)

**options**
- stun: array of objects, required
- turn: array of objects, required
- websocket: an instance of WebSocket
- user: which user do you want to connect to
- room: in which room do you want to connect to the user 
- immediate: do you want to run setup() immediately, default is true

```
let peer = new WebRTCPeer({ stun, turn, websocket, user, room, immediate: false })
```

All required.

### setup()

To setup the connection. If you set `options.immediate` to be true, you should not run setup() by yourself again.

### send(data)

Send data by `RTCDataChannel`, data can be any type of data.

```
await peer.send({ msg: 'Hello, there!' })
```

### getMedia(options)

Get user device media, return stream.

```
let stream = await peer.getMedia({ video: true, audio: false })
```

### stream(stream)

Send stream.

```
let stream = await peer.getMedia({ video: true, audio: false })
await peer.stream(stream)
```

### receive(type, callback)

Replace callback when you receive data message or stream.

```
await peer.receive('message', (data) => {
  // ...
})
await peer.receive('streams', (streams) => {
  // ...
})
```

### destory()

Unlink peer connection and destory context.

## WebRTCClient

### constructor(options)

**options**
- stun: array of objects, required
- turn: array of objects, required
- signaling: signaling websocket server url, required, pend `token` as a query string

```
let signaling = 'ws://localhost:8686?token=xxxx-xxxx-xxx'
let node = new WebRTCClient({ stun, turn, signaling })
```

### connect({ user, room })

Connect with another user.

```
node.connect({ user: 100202004 }) // if you do not pass room name, it means you want to create a connect not in a room
node.connect({ user: 100202004, room: 291445 })
```

Why you need a room name?
In fact, in a WebRTCClient instance, you can connect to multiple users (WebRTCPeer can only connect to another peer), with each user using one peer. But some times you may in a chat room, so two users may need more than one connection, pass a room name to certain which to connect.

### send({ user, room, data })

Send data to user in certain room.

```
await node.send({ user: 1002034, data: 'I love you❤️' })
```

### media({ user, room, options })

Send user device media to another user.

```
await node.media({ user: 1244345, options: { video: true, audio: true } })
```

### receive({ user, room, type, callback })

Do callback when receive certain type of data.

```
node.receive({
  user: 12452343,
  type: 'message',
  callback: (data) => {
    alert(data)
  },
})
node.receive({
  user: 12452343,
  type: 'streams',
  callback: (streams) => {
    $('video')[0].srcObj = streams[0]
  },
})
```

NOTICE: you'd better register receivers before call `send` and `media`.

### destory()

Destory all connections in this node.

## websocket server

You should implement your own signaling websokcet server. However I have provided one package:

```
npm install --save hello-webrtc-server
```

And then:

```
const SignalingServer = require('hello-webrtc-server')
const server = new SignalingServer()
```

And then use `ws://your-host.com:8686` as signaling server address to pass into WebRTCClient or WebRTCPeer.
