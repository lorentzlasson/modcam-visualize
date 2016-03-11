var express = require('express')
var http = require('http')
var app = express()
var routes = require('./routes')

app.use('/peoplecount', routes.peoplecount)
app.use('/broadcast', routes.broadcast)

app.use(express.static(__dirname + '/public'))

var server = http.createServer(app)
module.exports = server
