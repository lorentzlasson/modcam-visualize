const debug = require('debug')('modcam:iotf')
const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv()
const creds = appEnv.getServiceCreds('my-iotf')
const iotf = require('ibmiotf')
const websocket = require('../websocket')

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
	client.on('deviceEvent', receiveCount)
}

var receiveCount = (deviceType, deviceId, eventType, format, payload) => {
	debug('%s received', eventType)
	var message = payload.toString()
	websocket.broadcast(message)
}

module.exports = {
	start
}
