const { Server, Client } = require('ws-communicator')

const server = new Server({ port: 3333 })

server.onStart(() => console.log('Listening'))
server.onConnection(client => {
  console.log(client)
  client.onMessage('*', console.log)
  client.sendMessage('welcome', { hi: true })
})
