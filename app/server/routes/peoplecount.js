var express = require('express')
var router = express.Router()
var util = require('../../util')
var db = require('../../database/peoplecount')

router.get('*', (req, res, next) => {
	var date = new Date(req.query.date)
	if(!util.isValidDate(date)){
		return res.status(400).json({
			error: 'invalid date'
		})
	}
	req.date = date
	return next()
})

router.get('/day/', (req, res) => {
	db.getByDay(req.date)
	.then((counts) => {
		res.json({
			date: req.date,
			counts
		})
	}, (err) => {
		res.status(400).json({
			error: err
		})
	})
})
			counts
		})
	}, (err) => {
		res.status(400).json({
			error: err
		})
	})
})

module.exports = router
