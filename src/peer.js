import Socket from './socket'
import HelloEvents from 'hello-events'

export default class WebRTCPeer extends HelloEvents {
  constructor({ stun, turn, websocket, user, room, immediate = true }) {
    super()

    let serverList = [].concat(stun||[]).concat(turn||[])
    let servers = {
      iceServers: serverList,
    }

    this.connection = new RTCPeerConnection(serverList.length ? servers : null)
    this.socket = new Socket(websocket)

    let done
    this.ready = new Promise((resolve) => done = resolve)

    websocket.onopen = () => {
      this.socket.emit('create', { user, room })
    }

    this.connection.onicecandidate = (e) => {
      this.socket.emit('icecandidate', e.candidate)
    }

    this.socket.on('icecandidate', (data) => {
      let candidate = new RTCIceCandidate(data)
      this.connection.addIceCandidate(candidate)
    })

    this.socket.on('offer', async (data) => {
      let desc = new RTCSessionDescription(data)
      await this.connection.setRemoteDescription(desc)

      let description = await this.connection.createAnswer()
      this.connection.setLocalDescription(description)
      this.socket.emit('answer', description)
    })

    this.socket.on('answer', async (data) => {
      let description = new RTCSessionDescription(data)
      this.connection.setRemoteDescription(description)

      done()
    })

    this.connection.ontrack = (e) => {
      let streams = e.streams
      this.trigger('streams', streams)
    }

    this.socket.on('error', (data) => {
      console.error('[HelloWebRTCPeer:]', data)
      this.trigger('error', data)
    })

    this.once('setup', async () => {
      let description = await this.connection.createOffer()
      this.connection.setLocalDescription(description)
      this.socket.emit('offer', description)
    })

    this.channel = this.connection.createDataChannel()
    this.channel.onmessage = (e) => {
      let data = e.data
      this.trigger('message', data)
    }
    this.channel.onclose = () => {
      this.channel = null
    }

    if (immediate) {
      this.setup()
    }
  }
  setup() {
    this.trigger('setup')
  }
  
  async getMedia(options) {
    await this.ready
    let stream = navigator.mediaDevices.getUserMedia(options)
    return stream
  }
  async stream(stream) {
    await this.ready
    let tracks = stream.getTracks()
    tracks.forEach((track) => {
      this.connection.addTrack(track, stream)
    })
    return tracks
  }
  async send(data) {
    await this.ready
    this.channel.send(data)
  }
  async receive(type, callback) {
    await this.ready
    this.on(type, callback)
  }
  async destory() {
    await this.ready
    this.channel.close()
    this.connection.close()
  
    this.connection = null
    this.channel = null
    this.socket = null
    this.ready = null
  }
}
