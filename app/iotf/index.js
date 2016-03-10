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
		'id': appEnv.name,
		'auth-key': creds.apiKey,
		'auth-token': creds.apiToken
	}
	console.log('config: %j', config)
	var client = new iotf.IotfApplication(config)
	client.connect()
	client.on('connect', () => {
		console.log('connected')
		client.subscribeToDeviceEvents('+', '+', 'count')
	})
	client.on('count', receiveCount)
}

var receiveCount = (deviceType, deviceId, eventType, format, payload) => {
	console.log('received: %s', payload)
	websocket.broadcast(payload)
}

module.exports = {
	start
}
