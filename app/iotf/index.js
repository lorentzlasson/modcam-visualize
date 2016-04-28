const debug = require('debug')('modcam:iotf')
const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv()
const creds = appEnv.getServiceCreds('my-iotf')
const iotf = require('ibmiotf')
const websocket = require('../websocket')
const db = require('../database/peoplecount')

if(!creds)
	throw new Error('credentials not found')

const start = () => {
	const config = {
		'org': creds.org,
		'id': appEnv.name || 'modcam-visualize',
		'auth-key': creds.apiKey,
		'auth-token': creds.apiToken
	}
	const client = new iotf.IotfApplication(config)
	client.connect()
	client.on('connect', () => {
		debug('connected')
		client.subscribeToDeviceEvents('+', '+', 'count')
	})
	client.on('deviceEvent', receiveCount)
}

const receiveCount = (deviceType, deviceId, eventType, format, payload) => {
	debug('%s received', eventType)
	const message = payload.toString()
	websocket.broadcast(message)
	db.storeCount(JSON.parse(message))
	.then((response) => {
		debug('response: %j', response)
	})
}

module.exports = {
	start
}
