var debug = require('debug')('modcam:iotf')
var cfenv = require('cfenv')
var appEnv = cfenv.getAppEnv()
var creds = appEnv.getServiceCreds('my-iotf')
var iotf = require('ibmiotf')
var websocket = require('../websocket')

if(!creds)
	throw new Error('credentials not found')

var start = () => {
	var config = {
		'org': creds.org,
		'id': appEnv.name || 'modcam-visualize',
		'auth-key': creds.apiKey,
		'auth-token': creds.apiToken
	}
	var client = new iotf.IotfApplication(config)
	client.connect()
	client.on('connect', () => {
		debug('connected')
		client.subscribeToDeviceEvents('+', '+', 'count')
	})
	client.on('count', receiveCount)
}

var receiveCount = (deviceType, deviceId, eventType, format, payload) => {
	debug('%s received', eventType)
	websocket.broadcast(payload)
}

module.exports = {
	start
}
