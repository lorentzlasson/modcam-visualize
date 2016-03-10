var cfenv = require('cfenv')
var appEnv = cfenv.getAppEnv()
var server = require('./server')
var websocket = require('./websocket')

server.listen(appEnv.port)
websocket.run()

console.log('server starting on ' + appEnv.url)
