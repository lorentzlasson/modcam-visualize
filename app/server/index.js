const express = require('express')
const http = require('http')
const app = express()
const routes = require('./routes')

app.use('/peoplecount', routes.peoplecount)
app.use('/broadcast', routes.broadcast)

app.use(express.static(__dirname + '/public'))

let server = http.createServer(app)
module.exports = server
