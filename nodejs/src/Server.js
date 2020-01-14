import { randomBytes } from 'crypto'
import { URLSearchParams } from 'url'
import { EventEmitter } from 'events'

import WebSocket from 'ws'

import { Client } from './Client'

export class Server {
  constructor(wssOpts) {
    this.emitter = new EventEmitter()
    this._clients = {}
    this._server = new WebSocket.Server(wssOpts, () => {
      this.emitter.emit('LISTENING')
    })
    this._server.on('connection', this._handleConnection.bind(this))
  }

  _handleConnection(ws, request) {
    const params = new URLSearchParams(`?${ request.url.split('?')[1] }`)
    const clientId = params.get('clientId') || randomBytes(32).toString('hex')

    ws.send(JSON.stringify({ event: '_clientId', clientId }))

    const clientOpts = { ws, request, id: clientId }
    if (!this._clients[clientId]) {
      this._clients[clientId] = new Client(clientOpts)
    } else {
      Object.assign(this._clients[clientId], clientOpts)
    }

    this._clients[clientId].sendMessage('CONNECT', { clientId })

    this.emitter.emit('CONNECT', this._clients[clientId])
  }

  onStart(cb) {
    this.emitter.on('LISTENING', cb)
  }

  onConnection(cb) {
    this.emitter.on('CONNECT', cb)
  }
}
