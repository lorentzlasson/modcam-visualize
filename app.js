var express = require('express');
var cfenv = require('cfenv');
var app = express();
var appEnv = cfenv.getAppEnv();

app.use(express.static(__dirname + '/public'));

app.listen(appEnv.port, '0.0.0.0', function() {

  console.log("server starting on " + appEnv.url);
});
