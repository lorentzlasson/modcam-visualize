var WebSocketServer = require('ws').Server
var server = require('../server')
var wss = new WebSocketServer({server, path: '/ws/counter'})

var run = () => {
	wss.on('connection', function(ws) {
		var id = setInterval(function() {
			ws.send(JSON.stringify(process.memoryUsage()), function() { /* ignore errors */ })
		}, 1000)
		console.log('started client interval')
		ws.on('message', function(data) {
			var msg = 'message received: ' + data
			console.log(msg)
			ws.send(msg)
		})
		ws.on('close', function() {
			console.log('stopping client interval')
			clearInterval(id)
		})
	})
}

module.exports = {
	run
}
