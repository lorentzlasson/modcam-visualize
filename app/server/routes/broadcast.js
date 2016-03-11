var express = require('express')
var router = express.Router()
var websocket = require('../../websocket')

router.post('/', (req, res) => {
	var message = req.query.message
	websocket.broadcast(message)
	res.end()
})

module.exports = router
