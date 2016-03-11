var debug = require('debug')('modcam:index')
var cfenv = require('cfenv')
var appEnv = cfenv.getAppEnv()
var server = require('./server')
var websocket = require('./websocket')
var iotf = require('./iotf')

server.listen(appEnv.port)
websocket.start()
iotf.start()

debug('server starting on ' + appEnv.url)
