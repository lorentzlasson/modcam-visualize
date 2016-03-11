var cfenv = require('cfenv')
var appEnv = cfenv.getAppEnv()
var creds = appEnv.getServiceCreds('my-cloudant')
var nano = require('nano')

if(!creds)
	throw new Error('credentials not found')

var cloudant = nano(creds.url)

module.exports = cloudant
