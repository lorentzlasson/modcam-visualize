var express = require('express')
var router = express.Router()

router.get('/day/:date', (req, res) => {
	var date = req.params.date

	res.json({
		date,
		count: 0
	})
})

module.exports = router
