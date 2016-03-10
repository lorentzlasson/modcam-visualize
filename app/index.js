var cfenv = require('cfenv')
var appEnv = cfenv.getAppEnv()
var server = require('./server')
var websocket = require('./websocket')
var iotf = require('./iotf')

server.listen(appEnv.port)
websocket.start()
iotf.start()

console.log('server starting on ' + appEnv.url)
