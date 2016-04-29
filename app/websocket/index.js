const debug = require('debug')('modcam:websocket')

let wss

const start = () => {
	const WebSocketServer = require('ws').Server
	const server = require('../server')
	wss = new WebSocketServer({server, path: '/ws/counter'})

	wss.on('connection', (ws) => {
		debug('client connected')

		ws.on('message', (data) => {
			const msg = 'message received: ' + data
			debug(msg)
			ws.send(msg)
		})

		ws.on('close', () => {
			debug('client disconnected')
		})
	})
}

const broadcast = (message) => {
	wss.clients.forEach((client) => {
		client.send(message)
	})
}

module.exports = {
	start,
	broadcast
}
