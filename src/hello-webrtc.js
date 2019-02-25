import WebRTCClient from './client'
import WebRTCPeer from './peer'

const HelloWebRTC = { WebRTCClient, WebRTCPeer }

export { WebRTCClient, WebRTCPeer }
export default HelloWebRTC

if (typeof module !== 'undefined') {
  module.exports = HelloWebRTC
}

if (typeof window !== 'undefined') {
  window.HelloWebRTC = HelloWebRTC
}