var express = require('express')
var router = express.Router()
var util = require('../../util')
var db = require('../../database/peoplecount')

router.get('/day/:date', (req, res) => {
	var date = new Date(req.params.date)
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
