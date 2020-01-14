import EventEmitter from './web_modules/eventemitter3'

export class Client {
  constructor(...wsOpts) {
    this.emitter = new EventEmitter()
    if (sessionStorage.getItem('clientId') !== null) {
      const url = new URL(wsOpts[0])
      url.searchParams.set('clientId', sessionStorage.getItem('clientId'))
      wsOpts[0] = url.href
    }
    this.ws = new WebSocket(...wsOpts)

    this.ws.addEventListener('message', this._handleMessage.bind(this))
  }

  _handleMessage(message) {
    try {
      const data = JSON.parse(message.data)
      if (data.event === '_clientId') {
        sessionStorage.setItem('clientId', data.clientId)
        return
      }
      this.emitter.emit('MESSAGE', { event: data.event, data: data.data, client: this, rawMessage: message })
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
