const debug = require('debug')('modcam:index')
const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv()
const server = require('./server')
const websocket = require('./websocket')
const iotf = require('./iotf')

server.listen(appEnv.port)
websocket.start()
iotf.start()

debug('server starting on ' + appEnv.url)
