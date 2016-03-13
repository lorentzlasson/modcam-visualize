var express = require('express')
var router = express.Router()
var util = require('../../util')
var db = require('../../database/peoplecount')

router.get('/day/:date', (req, res) => {
	var date = new Date(req.params.date)
	if(!util.isValidDate(date)){
		return res.status(400).json({
			error: 'invalid date'
		})
	}

	db.getByDay(date)
	.then((counts) => {
		res.json({
			counts
		})
	}, (err) => {
		res.status(400).json({
			error: err
		})
	})
})

module.exports = router
