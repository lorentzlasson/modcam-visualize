var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var server = require('./server')
server.listen(appEnv.port)
console.log("server starting on " + appEnv.url);