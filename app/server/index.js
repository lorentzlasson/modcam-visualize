var express = require('express')
var http = require('http')
var app = express()
var websocket = require('../websocket')
var routes = require('./routes')

app.use('/peoplecount', routes.peoplecount)

app.post('/broadcast', (req, res) => {
	var message = req.query.message
	websocket.broadcast(message)
	res.end()
})

app.use(express.static(__dirname + '/public'))

var server = http.createServer(app)
module.exports = server
