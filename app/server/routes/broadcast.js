const express = require('express')
const router = express.Router()
const websocket = require('../../websocket')

router.post('/', (req, res) => {
	var message = req.query.message
	websocket.broadcast(message)
	res.end()
})

module.exports = router
