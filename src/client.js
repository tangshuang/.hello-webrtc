import WebRTCPeer from './peer'
import Socket from './socket'
import HelloEvents from 'hello-events'

export default class WebRTCClient extends HelloEvents {
  constructor(options) {
    super()
    
    let { signaling } = options

    this.options = options
    this.websocket = new WebSocket(signaling)
    this.socket = new Socket(this.websocket)
    this.connections = []

    let done
    this.ready = new Promise(resolve => done = resolve)
    this.websocket.onopen = () => {
      this.socket.emit('online', null)
      done()
    }
    
    this.socket.on('request', ({ user, room }) => {
      let peer = this.find({ user, room })
      if (!peer) {
        this.append({ user, room })
      }
      this.socket.emit('response', { user, room })
    })
    this.socket.on('response', ({ user, room }) => {
      let peer = this.find({ user, room })
      if (!peer) {
        return
      }
      peer.setup()
    })
    this.socket.on('offline', () => {
      this.destory()
    })
    this.socket.on('error', (data) => {
      console.error('[HelloWebRTCClient:]', data)
      this.trigger('error', data)
    })
  }

  find({ user, room = '$' }) {
    let peer = this.connections.find(item => item.user === user && room === room)
    return peer
  }
  append({ user, room = '$' }) {
    let { stun, turn } = this.options
    let websocket = this.websocket
    let peer = new WebRTCPeer({ stun, turn, websocket, user, room })
    this.connections.push({
      user,
      room,
      peer,
    })
    return peer
  }

  async connect({ user, room = '$' }) {
    await this.ready
    this.append({ user, room })
    this.socket.emit('request', { user, room })
  }
  async send({ user, room = '$', data }) {
    await this.ready
    let peer = this.find({ user, room })
    if (!peer) {
      throw new Error('[HelloWebRTCClient:] connection not exists.')
    }
    await peer.send(data)
  }
  async media({ user, room = '$', options }) {
    await this.ready
    let peer = this.find({ user, room })
    if (!peer) {
      throw new Error('[HelloWebRTCClient:] connection not exists.')
    }
    let stream = await peer.getMedia(options)
    await peer.stream(stream)
  }
  async receive({ user, room = '$', type, callback }) {
    await this.ready
    let peer = this.find({ user, room })
    if (!peer) {
      throw new Error('[HelloWebRTCClient:] connection not exists.')
    }
    peer.receive(type, callback)
  }
  async destory() {
    await this.ready
    this.connections.forEach(({ peer }) => {
      peer.destory()
    })
    this.socket.emit('offline')

    this.options = null
    this.websocket = null
    this.socket = null
    this.connections = null
    this.ready = Promise.reject(new Error('[HelloWebRTCClient:] Destoried.'))
  }
}
