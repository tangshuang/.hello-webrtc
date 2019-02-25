import uuidv4 from 'uuid/v4'

export default class Socket {
  constructor(websocket) {
    this.websocket = websocket
    this.signature = uuidv4()
    this.callbacks = []
  }
  on(event, callback) {
    let fn = (e) => {
      let message = e.data
      let { type, data, signature } = JSON.parse(message)
      if (type === event && signature === this.signature) {
        callback(data)
      }
    }
    this.websocket.addEventListener('message', fn)
    this.callbacks.push({
      event,
      callback,
      fn,
    })
    return () => {
      this.off(event, callback)
    }
  }
  off(event, callback) {
    let item = this.callbacks.find((cb) => cb.event === event && cb.callback === callback)
    this.websocket.removeEventListener('message', item.fn)
    this.callbacks = this.callbacks.filter((cb) => cb !== item)
  }
  emit(event, data) {
    let message = JSON.stringify({ type: event, data, signature: this.signature })
    this.websocket.send(message)
  }
}
