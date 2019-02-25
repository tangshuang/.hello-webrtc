import { WebRTCNode } from '../src/hello-webrtc'
import uuidv4 from 'uuid/v4'

require("babel-polyfill")

const uuid = uuidv4()
console.log(uuid)

const $ = (selector) => document.querySelector(selector)
const $append = (html, selector) => {
  let el = document.createElement('div')
  el.innerHTML = html
  $(selector).appendChild(el.children[0])
}

const node = new WebRTCNode({
  signaling: 'ws://localhost:8686?token=' + uuid,
})
node.socket.on('online', (user) => {
  console.log(user, 'online')
  $append(`<li><input type="radio" name="user"><span>${user}</span></li>`, '#users')
})