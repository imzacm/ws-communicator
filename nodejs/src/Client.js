import { EventEmitter } from 'events'

import WebSocket from 'ws'

export class Client {
  constructor(...wsOpts) {
    this.emitter = new EventEmitter()
    if (wsOpts[0].id && wsOpts[0].ws && wsOpts[0].request) {
      Object.assign(this, wsOpts[0])
    } else {
      this.ws = new WebSocket(...wsOpts)
    }

    this.ws.on('message', this._handleMessage.bind(this))
  }

  _handleMessage(message) {
    try {
      const data = JSON.parse(message)
      this.emitter.emit('MESSAGE', { event: data.event, data: data.data, client: this })
    } catch (error) {
      this.sendError(error)
    }
  }

  sendMessage(event, data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
      return
    }
    setTimeout(() => this.sendMessage(event, data), 1)
  }

  sendError(error) {
    this.sendMessage('error', { error: error.message })
  }

  onMessage(event, cb) {
    this.emitter.on('MESSAGE', msg => {
      if (msg.event !== event && event !== '*') {
        return
      }
      cb(msg)
    })
  }
}
