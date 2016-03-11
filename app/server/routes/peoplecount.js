var express = require('express')
var router = express.Router()
var db = require('../../database/peoplecount')

router.get('/day/:date', (req, res) => {
	db.getByDay(req.params.date)
	.then((data) => {
		res.json({
			data
		})
	}, (err) => {
		res.status(400).json({
			error: err
		})
	})
})

module.exports = router
