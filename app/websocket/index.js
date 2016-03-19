const debug = require('debug')('modcam:websocket')

var wss

var start = () => {
	var WebSocketServer = require('ws').Server
	var server = require('../server')
	wss = new WebSocketServer({server, path: '/ws/counter'})

	wss.on('connection', function(ws) {
		debug('client connected')

		ws.on('message', function(data) {
			var msg = 'message received: ' + data
			debug(msg)
			ws.send(msg)
		})

		ws.on('close', function() {
			debug('client disconnected')
		})
	})
}

var broadcast = (message) => {
	wss.clients.forEach((client) => {
		client.send(message)
	})
}

module.exports = {
	start,
	broadcast
}
