const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv()
const creds = appEnv.getServiceCreds('my-cloudant')
const nano = require('nano')

if(!creds)
	throw new Error('credentials not found')

const cloudant = nano(creds.url)

module.exports = cloudant
